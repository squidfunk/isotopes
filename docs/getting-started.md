# Getting started

## Installation

*Isotopes* can be installed with `npm`:

``` sh
npm install isotopes aws-sdk
```

TypeScript typings are provided as part of the package, so no need to install a
separate package. The [aws-sdk][1] is listed as a peer dependency, so make sure
it is installed. Note that when you run *Isotopes* from within AWS Lambda the
SDK is already installed.

  [1]: https://www.npmjs.com/package/aws-sdk

## Usage

!!! info "Isotopes = SimpleDB + TypeScript"

    The following instructions are intended for usage with TypeScript. You can
    also use *Isotopes* from plain JavaScript by omitting all typings from the
    examples, but what would be the point? [Learn TypeScript][2], it's awesome!

  [2]: https://basarat.gitbooks.io/typescript/

First, import *Isotopes* into your project:

``` ts
import { Isotope } from "isotopes"
```

Next, define a TypeScript interface for the data you want to store, e.g. a
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
is used as an item name. The item name must be on the first level of the type
to be stored, all other variables can be arbitrarily nested. Next, create an
isotope for the type, e.g. for a SimpleDB domain named `tasks`:

``` ts
const tasks = new Isotope<Task>({
  domain: "tasks",                     /* SimpleDB domain name */
  key: "id"                            /* SimpleDB item name (primary key) */
})
```

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
interfacing with SimpleDB.

### Create a domain

> [Reference][3] for `Isotope.create`

If the SimpleDB domain doesn't exist, create it:

``` ts
await isotope.create()
```

  [3]: reference/isotope/create.md

### Persist an item

> [Reference][4] for `Isotope.put`

Persisting an item is as simple as:

``` ts
await tasks.put(task) // => void
```

  [4]: reference/isotope/put.md

### Retrieve an item

> [Reference][5] for `Isotope.get`

Retrieving an item by primary key (unique identifier, in our example `id`):

``` ts
const task = await tasks.get("example") // => Task | undefined
```

  [5]: reference/isotope/get.md

### Delete an item

> [Reference][6] for `Isotope.delete`

Delete an item by primary key:

``` ts
await tasks.delete("example") // => void
```

  [6]: reference/isotope/delete.md

### Query a domain

> [Reference][7] for `Isotope.select`

  [7]: reference/isotope/select.md

We can also build queries using a stripped-down version of the [squel][7] query
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

  [8]: https://hiddentao.com/squel/

### Handling errors

All methods except `getQueryBuilder` return Promises, so they are best to be
used with ES7's `async/await` and wrapped in `try/catch` blocks for error
handling purposes:

``` ts
try {
  await tasks.put(task)
} catch (err) {
  /* Handle error */
}
```
