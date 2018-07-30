[![Travis][travis-image]][travis-link]
[![Codecov][codecov-image]][codecov-link]
[![Gitter][gitter-image]][gitter-link]
[![NPM][npm-image]][npm-link]

  [travis-image]: https://travis-ci.org/squidfunk/isotopes.svg?branch=master
  [travis-link]: https://travis-ci.org/squidfunk/isotopes
  [codecov-image]: https://img.shields.io/codecov/c/github/squidfunk/isotopes/master.svg
  [codecov-link]: https://codecov.io/gh/squidfunk/isotopes
  [gitter-image]: https://badges.gitter.im/squidfunk/isotopes.svg
  [gitter-link]: https://gitter.im/squidfunk/isotopes
  [npm-image]: https://img.shields.io/npm/v/isotopes.svg
  [npm-link]: https://npmjs.com/package/isotopes

# Isotopes

A serverless, typed and super lightweight object store that enables storage,
indexing and querying of JSON documents in [AWS SimpleDB][1] using SQL queries.
*Isotopes* is just perfect for small to medium-sized datasets, especially for
indexing data from other AWS services for flexible querying. It can easily be
run from within [AWS Lambda][2] and reduces the boilerplate that is necessary
to interface with SimpleDB to an absolute minimum.

  [1]: https://aws.amazon.com/de/simpledb/
  [2]: https://aws.amazon.com/de/lambda/

## Installation

``` sh
npm install isotopes aws-sdk
```

In your project:

``` ts
import { Isotope } from "isotopes"
```

TypeScript typings are provided as part of the package, so no need to install a
separate package. However, the [aws-sdk][3] is listed as a peer dependency, so
make sure it is installed. When you run *Isotopes* from within AWS Lambda the
SDK is already installed.

  [3]: https://www.npmjs.com/package/aws-sdk

## Usage

> Note: the following instructions are intended for usage with TypeScript. You
  can also use *Isotopes* from plain JavaScript by omitting all typings from
  the examples, but what's the point? [Learn TypeScript][4], it's awesome!

  [4]: https://basarat.gitbooks.io/typescript/

First, define a TypeScript interface for the data you want to store, e.g. a
type for running a task on a cluster:

``` ts
export interface Task {
  id: string                           /* Unique identifier */
  active: boolean                      /* Whether the task can be scheduled */
  props: {
    image: string                      /* Docker image to use */
    cpus: number                       /* Number of CPUs */
    memory: number                     /* Reserved memory */
    command?: string                   /* Command override */
  },
  tags: string[]                       /* Tags for categorization */
}
```

Every type that is handled by *Isotopes* must contain a unique identifier which
is used as an item name. The item name *should* be on the first level of the
type to be stored, all other variables can be arbitrarily nested. Next, create
an isotope for the type, e.g. for a SimpleDB domain named `tasks`:

``` ts
const tasks = new Isotope<Task>({
  domain: "tasks",                     /* SimpleDB domain name */
  key: "id"                            /* SimpleDB item name (primary key) */
})
```

> Note: *Isotopes* provides a thin wrapper around AWS SimpleDB domains which
  enables storage and retrieval of typed hierarchical data, but it won't create
  or destroy domains by itself. However, [Terraform][5] is an excellent tool
  for this.

Now, suppose we have the following item:

``` ts
const task: Task = {
  id: "example",
  active: true,
  props: {
    image: "busybox",
    cpus: 2,
    memory: 2048
  },
  tags: [
    "TAG_1",
    "TAG_2"
  ]
}
```

We can persist, retrieve and delete items from the isotope by using a simple
API, cleverly omitting all the boilerplate that is normally necessary for
interfacing with SimpleDB. Persist an item:

``` ts
await tasks.put(task) // => void
```

Retrieve an item by primary key (unique identifier, in our example `id`):

``` ts
const task = await tasks.get("example") // => Task | undefined
```

Delete an item by primary key:

``` ts
await tasks.delete("example") // => void
```

Querying items using the [squel][6] query builder interface:

``` ts
/* Construct SQL expression with query builder */
const query = tasks.getQueryBuilder()
  .where("`active` = ?", true)
  .order("`props.memory >= ?`", 2048)
  .limit(100)

/* Query domain and process items */
let result = await tasks.select(query)
do {
  result.items.map(console.log)

  /* Continue with next page, if any */
  result = result.next
    ? await result.next()
    : undefined
} while (result)
```

  [5]: https://www.terraform.io/
  [6]: https://hiddentao.com/squel/

## Advanced usage

### Error handling

All methods except `getQueryBuilder` return Promises, so they are best to be
used with `async/await` and wrapped in a `try/catch` block for error handling
purposes:

``` ts
try {
  await tasks.put(task)
} catch (err) {
  /* Handle error */
}
```

### Persistence, retrieval and deletion of partial types

By default, *Isotopes* forces only valid entries to be written to SimpleDB which
means that all non-optional fields need to be defined in the payload (otherwise
the TypeScript compiler will moan). However, SimpleDB allows reading and writing
of partial attribute values, so it might be desirable in some cases to loosen
that restriction and allow partial reads and writes. *Isotopes* allows both
configurations through simple generic typing.

``` ts
class Isotope<
  T    extends {},                     /* Data type */
  TPut extends Partial<T> = T,         /* Data type expected by PUT operation */
  TGet extends Partial<T> = TPut       /* Data type returned by GET operation */
> {}
```

The first type argument is mandatory and defines the base type. The second
and third type arguments can be used to specify what exact types `PUT` and `GET`
operations return but normally they are equal to the base type.

Allow complete values only:

``` ts
new Isotope<Task>(...)
```

Allow partial values in `PUT` and `GET` operations:

``` ts
new Isotope<Task, Partial<Task>>(...)
```

Allow partial values in `GET` operations only:

``` ts
new Isotope<Type, Type, Partial<Type>>(...)
```

Furthermore, `SELECT` operations are assumed to return the same type as `GET`
operations. Since this may be different on a case-by-case basis (depending on
the specific SQL query), it may be overridden on a per-query basis:

``` ts
await tasks.select<Partial<Task>>(...)
```

### Encoding

The encoding can be set when creating the isotope, e.g.:

``` ts
const tasks = new Isotope<Task>({
  format: { encoding: "text" },
  domain: "tasks",
  key: "id"
})
```

#### JSON (recommended)

> `options.format.encoding: "json"`

All values are JSON-encoded, which means that strings are double-quoted,
whereas numbers and booleans are written literally:

``` json
{
  "Name": "example",
  "Attributes": [
    { "Name": "active", "Value": "true" },
    { "Name": "props.image", "Value": "\"busybox\"" },
    { "Name": "props.cpus", "Value": "2" },
    { "Name": "props.memory", "Value": "2048" },
    { "Name": "tags[]", "Value": "\"TAG_1\"" },
    { "Name": "tags[]", "Value": "\"TAG_2\"" }
  ]
}
```

If you don't plan to use the SimpleDB domain from a non-*Isotope* client, you
should always stick with JSON-encoding because it is more safe than text
encoding and comes with no limitations.

#### Text

> `options.format.encoding: "text"`

*Isotopes* provides the ability to use an alternate encoding and store strings
as literals so they are written without quotes:

``` json
{
  "Name": "example",
  "Attributes": [
    { "Name": "active", "Value": "true" },
    { "Name": "props.image", "Value": "busybox" },
    { "Name": "props.cpus", "Value": "2" },
    { "Name": "props.memory", "Value": "2048" },
    { "Name": "tags[]", "Value": "TAG_1" },
    { "Name": "tags[]", "Value": "TAG_2" }
  ]
}
```

When decoding the data, we intercept `JSON.parse` assuming that we encountered
a literal string if it fails to decode. It's a hack and yes, imposes some
limitations:

1. Numbers that are encoded as strings (e.g. house numbers, because they can
   exhibit values as `2A` etc.) are interpreted as numbers when decoded with
   `JSON.parse`. *Countermeasure*: ensure that numbers are typed as numbers, or
   string fields contain at least one non-number character.

2. If strings accidentally contain valid JSON, e.g. `{}`, the value is parsed
   as JSON and the field gets assigned that precise value. This also breaks
   type safety. *Countermeasure*: ensure that your strings are never valid JSON
   by prepending some character that makes `JSON.parse` fail.

As enforcing as those restrictions may seem to be, it is often true that
the properties and characteristics of the data are known a-priori and those
special cases can be ruled out with great certainty. This also means that
querying the data from other parts of your system gets easier as string
values don't need to be enclosed into quotes (and don't start thinking about
LIKE queries) which is far more user-friendly.

### Consistency

> `options.client.consistency: true`

Strong consistency for `GET` and `SELECT` operations can be enabled when
creating an isotope:

``` ts
const tasks = new Isotope<Task>({
  client: { consistency: true },
  domain: "tasks",
  key: "id"
})
```

## License

**MIT License**

Copyright (c) 2018 Martin Donath

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
