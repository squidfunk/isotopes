[![Travis][travis-image]][travis-link]
[![Codecov][codecov-image]][codecov-link]
[![Gitter][gitter-image]][gitter-link]
[![GitHub][github-image]][github-link]

  [travis-image]: https://travis-ci.org/squidfunk/isotopes.svg?branch=master
  [travis-link]: https://travis-ci.org/squidfunk/isotopes
  [codecov-image]: https://img.shields.io/codecov/c/github/squidfunk/isotopes/master.svg
  [codecov-link]: https://codecov.io/gh/squidfunk/isotopes
  [gitter-image]: https://badges.gitter.im/squidfunk/isotopes.svg
  [gitter-link]: https://gitter.im/squidfunk/isotopes
  [github-image]: https://img.shields.io/github/release/squidfunk/isotopes.svg
  [github-link]: https://github.com/squidfunk/isotopes/releases

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

TypeScript typings are provided as part of the package, so no need to install a
separate package. However, the [aws-sdk][3] is listed as a peer dependency, so
make sure it is installed. Note that when you run *Isotopes* from within AWS
Lambda the SDK is already installed.

  [3]: https://www.npmjs.com/package/aws-sdk

## Usage

> Note: the following instructions are intended for usage from TypeScript. You
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
  }
}
```

Every type that is handled with *Isotopes* must contain a unique identifier
which is used for item identification. The identifier *should* be on the first
level of the type to be stored, all other variables can be arbitrarily nested.
Next, create an isotope for the type, e.g. for a SimpleDB domain named `tasks`:

``` ts
const tasks = new Isotope<Task>({
  domain: "tasks",
  key: "id"
})
```

> Note: *Isotopes* provides a thin wrapper around AWS SimpleDB domains which
  enables storage and retrieval of typed hierarchical data, but it won't create
  or destroy domains by itself. However, [Terraform][5] is an excellent tool
  for this.

  [5]: https://www.terraform.io/

### Persist an item

Now we can persist and retrieve instances of our type from the isotope by using
a simple API, cleverly omitting all the boilerplate that is normally necessary
for interfacing with SimpleDB. Suppose we have the following item which we want
to persist:

``` ts
const task: Task = {
  id: "example",
  active: true,
  props: {
    image: "busybox",
    cpus: 2,
    memory: 2048
  }
}
```

Persistence is as simple as:

``` ts
await tasks.put(task)
```

### Retrieve an item

Items can be retrieved by their primary key (in our example `id`), which we
defined when initializing the isotope:

``` ts
const task: Task = await tasks.get("example")
```

If there's no item to be returned for the given primary key, `task` will be
`undefined`. Note that specific attributes can be queried by providing the
object paths for each field of interest as a second parameter, e.g.:

``` ts
const task: Partial<Task> = await tasks.get("example", ["active", "props.cpus"])
```

Querying specific attributes will make the returned entity a [Partial][6] type.
Normally it is assumed that (due to the power of TypeScript) all items satisfy
the basic type constraints and contain all required fields. If you want to do
partial PUTs and GETs and wonder about type safety,

  [6]: https://www.typescriptlang.org/docs/handbook/advanced-types.html

### Error handling

TBD

### Typings

TBD

### Encodings

#### JSON <small>default</small>

All values are JSON-encoded, which means that strings are double-quoted,
whereas numbers and booleans are written literally:

``` json
{
  "Name": "example",
  "Attributes": [
    { "Name": "active", "Value": "true" },
    { "Name": "props.image", "Value": "\"busybox\"" },
    { "Name": "props.cpus", "Value": "2" },
    { "Name": "props.memory", "Value": "2048" }
  ]
}
```

#### Text <small>default</small>

``` json
{
  "Name": "example",
  "Attributes": [
    { "Name": "active", "Value": "true" },
    { "Name": "props.image", "Value": "busybox" },
    { "Name": "props.cpus", "Value": "2" },
    { "Name": "props.memory", "Value": "2048" }
  ]
}
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
