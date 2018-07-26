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
indexing and querying of JSON documents in AWS SimpleDB using SQL queries.

## Installation

``` sh
npm install isotopes
```

TypeScript typings are provided as part of the package.

## Usage

First, define a TypeScript interface for the data you want to store, e.g. a
type for running a task on a cluster:

``` ts
export interface Task {
  id: string
  active: boolean
  props: {
    image: string
    cpus: number
    memory: number
    command?: string
  }
}
```

Next, create an isotope for the type using an **existing** SimpleDB domain.
Isotope provides a thin wrapper around AWS SimpleDB domains which enables
storage and retrieval of typed hierarchical data. The domain should be empty,
because this library assumes JSON encoding for all entries that are part of the
domain.

``` ts
const tasks = new Isotope<Task>({ domain: "...", key: "id" })
```

Now we can persist and retrieve instances of our type from the isotope by using
a simple API, cleverly omitting all the boilerplate that is normally necessary
for interfacing with SimpleDB. Persistence is as simple as:

``` ts
await tasks.put({
  id: "example",
  active: true,
  props: {
    image: "busybox",
    cpus: 2,
    memory: 2048
  }
})
```

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

Retrieval is equally straight forward:

``` ts
const task = await tasks.get("example")
```

TBD

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
