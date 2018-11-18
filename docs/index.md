hero: A modern AWS SimpleDB client

---

# Isotopes

## Getting the most out of AWS SimpleDB

A serverless, typed and super lightweight object store that enables storage,
indexing and querying of JSON documents in [AWS SimpleDB][1] using SQL queries.
*Isotopes* is just perfect for small to medium-sized datasets, especially for
indexing metadata from other AWS services for flexible querying. It can easily
be run from within [AWS Lambda][2] and reduces the boilerplate that is necessary
to interface with SimpleDB to an absolute minimum.

  [1]: https://aws.amazon.com/de/simpledb/
  [2]: https://aws.amazon.com/de/lambda/

## Quick start

``` sh
npm install isotopes aws-sdk
```

In your project:

``` ts
import { Isotope } from "isotopes"

const isotope = new Isotope<T>({
  domain: "<domain>",
  key: "<keyof T>"
})
```

For detailed instructions see the [getting started guide][3] and the [API
reference guide][4].

  [3]: getting-started.md
  [4]: reference/isotope/new.md
