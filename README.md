[![Github Action][action-image]][action-link]
[![Codecov][codecov-image]][codecov-link]
[![npm][npm-image]][npm-link]

  [action-image]: https://github.com/squidfunk/isotopes/workflows/ci/badge.svg?branch=master
  [action-link]: https://github.com/squidfunk/isotopes/actions
  [travis-image]: https://travis-ci.org/squidfunk/isotopes.svg?branch=master
  [travis-link]: https://travis-ci.org/squidfunk/isotopes
  [codecov-image]: https://img.shields.io/codecov/c/github/squidfunk/isotopes/master.svg
  [codecov-link]: https://codecov.io/gh/squidfunk/isotopes
  [npm-image]: https://img.shields.io/npm/v/isotopes.svg
  [npm-link]: https://npmjs.com/package/isotopes

# Isotopes

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

  [3]: https://squidfunk.github.io/isotopes/getting-started/
  [4]: https://squidfunk.github.io/isotopes/reference/isotope/new/

## License

**MIT License**

Copyright (c) 2018-2020 Martin Donath

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
