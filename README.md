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
to interface with SimpleDB to an absolute minimum. It is also fault-tolerant
and will retry failed requests using a configurable strategy.

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

If the SimpleDB domain doesn't exist, create it:

``` ts
await isotope.create()
```

> Note: *Isotopes* provides a thin wrapper around AWS SimpleDB domains which
  enables storage and retrieval of typed hierarchical data, but it won't create
  or destroy domains automatically. It is absolutely recommended to use
  [Terraform][5] for creation and destruction.

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

We can also build queries using a stripped-down version of the [squel][6] query
builder interface:

``` ts
const expr = tasks.getQueryBuilder()
  .where("`active` = ?", true)
  .order("`props.memory >= ?`", 2048)
  .limit(100)
```

The query expression can then be used to perform a `SELECT` operation:

``` ts
await tasks.select(expr)
```

Please see the API reference for a detailed explanation of the available
methods.

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
  TPut extends DeepPartial<T> = T,     /* Data type expected by PUT operation */
  TGet extends DeepPartial<T> = TPut   /* Data type returned by GET operation */
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
new Isotope<Task, DeepPartial<Task>>(...)
```

Allow partial values in `GET` operations only:

``` ts
new Isotope<Task, Task, DeepPartial<Task>>(...)
```

Furthermore, `SELECT` operations are assumed to return the same type as `GET`
operations. Since this may be different on a case-by-case basis (depending on
the specific SQL query), it may be overridden on a per-query basis:

``` ts
import { DeepPartial } from "isotopes"
await tasks.select<DeepPartial<Task>>(...)
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

## API Reference

#### `new Isotope<T, [TPut, [TGet]]>(IsotopeOptions<T>: options): Isotope<T>`

Initializes an isotope using the given options of which `domain` and `key` are
mandatory. The `format` option can be used to define the serialization method
that is used for the values before writing them to SimpleDB. The `client` option
enables configuration of the underlying SimpleDB client.

| Parameter                     | Type                   | Default  | Description                       |
| ----------------------------- | ---------------------- | -------- | --------------------------------- |
| `options.domain`              | `string`               | `-`      | SimpleDB domain name              |
| `options.key`                 | `keyof T`              | `-`      | SimpleDB item name (primary key)  |
| `options.format?`             | `IsotopeFormatOptions` | `"json"` | Format options                    |
| `options.format?.encoding?`   | `"json" \| "text"`     | `"json"` | Encoding method for values        |
| `options.format?.multiple?`   | `boolean`              | `true`   | Multi-attribute values for arrays |
| `options.client?`             | `IsotopeClientOptions` | `"json"` | SimpleDB client options           |
| `options.client?.consistent?` | `boolean`              | `false`  | Whether to use consistent reads   |
| `options.client?.retry?`      | `OperationOptions`     | `false`  | Retry strategy options            |

Under the hood, *Isotopes* uses [retry][7], a library implementing exponential
backoff as a retry strategy. [`OperationOptions`][8] is the input parameter
for `retry.operation` which is used to implement retryability.

**Example**

``` ts
const isotope = new Isotope<T>({
  domain: "<domain>",
  key: "<keyof T>"
})
```

  [7]: https://github.com/tim-kos/node-retry
  [8]: https://github.com/tim-kos/node-retry#retryoperationoptions

#### `isotope.create(): Promise<void>`

Creates the underlying SimpleDB domain.

**Example**

``` ts
await isotope.create()
```

#### `isotope.destroy(): Promise<void>`

Destroys the underlying SimpleDB domain.

**Example**

``` ts
await isotope.destroy()
```

#### `isotope.get(id: string, names?: string[]): Promise<TGet | undefined>`

Retrieves an item from SimpleDB. The first parameter is assumed to be a value
of the primary key field specified during initialization. The second parameter
can be an array of flattened field names (e.g `foo.bar`) that would also be
passed to a `SELECT` statement when working with SimpleDB in order to obtain
partial objects. If the second parameter is specified, this method will
return a Promise resolving with a `DeepPartial<T>` type.

| Parameter | Type       | Default     | Description     |
| --------- | ---------- | ----------- | --------------  |
| `id`      | `string`   | `-`         | Identifier      |
| `names?`  | `string[]` | `undefined` | Attribute names |

Note that this method may return partial items if they are stored as such in
SimpleDB, so to obtain type safety with TypeScript, you have to make sure that
all items define all required fields before retrieving them from SimpleDB. If
unsure, it's best to configure *Isotopes* with `Partial<T>` or `DeepPartial<T>`
for `TGet` (see respective section).

**Example**:

``` ts
const item = await isotope.get(id)
```

#### `isotope.put(data: TPut): Promise<void>`

Persists an item within SimpleDB. The keys of the item are flattened, the values
are encoded according to the method specified in `options.format.encoding` when
initializing the isotope before delegating to SimpleDB. This method assumes
that values are of type `TPut` which is specified during initilization (see
respective section). By default partial values will be rejected due to the
provided typings. In order to write partial values, *Isotopes* must be
configured with `Partial<T>` or `DeepPartial<T>` for `TPut`

| Parameter | Type   | Default | Description           |
| --------- | ------ | ------- | --------------------- |
| `data`    | `TPut` | `-`     | Data to be persisted  |

**Example**

``` ts
await isotope.put(data)
```

#### `isotope.delete(id: string, names?: string[]): Promise<void>`

Deletes an item or specific attributes from SimpleDB. Again, the first parameter
is assumed to be an identifier, the optional second to be an array of flattened
field names. By providing those names, specific fields can be deleted.

| Parameter | Type       | Default     | Description     |
| --------- | ---------- | ----------- | --------------  |
| `id`      | `string`   | `-`         | Identifier      |
| `names?`  | `string[]` | `undefined` | Attribute names |

**Example**

``` ts
await isotope.delete(id)
```

#### `isotope.select(expr: IsotopeSelect<T> | string, prev?: string): Promise<void>`

Retrieves a set of items matching the given SQL query.

| Parameter | Type               | Default     | Description          |
| --------- | ------------------ | ----------- | -------------------- |
| `expr`    | `IsotopeSelect<T>` | `-`         | SQL query expression |
| `prev?`   | `string`           | `undefined` | Pagination token     |

Querying items is best done using the [squel][6] query builder interface:

``` ts
const expr = isotope.getQueryBuilder()
  .where("`foo.bar` = ?", 42)
  .limit(100)
```

A `SELECT` operation may return a pagination token, as SimpleDB uses token-based
pagination. This token can then be passed again to the same method to obtain
the next page of items.

**Example**

``` ts
let prev
do {
  const { items, next } = await isotopes.select(expr, prev)
  items.map(console.log)
  prev = next
} while (prev)
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
