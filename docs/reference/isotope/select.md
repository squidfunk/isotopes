# Isotope.select

*Retrieve a set of items from SimpleDB matching a given SQL query expression*

## Signature

``` ts
Isotope<T, TPut = T, TGet = T>.select<TSelect extends TGet = TGet>(
  expr: IsotopeSelect<T> | string,
  prev?: string
): Promise<IsotopeResult<TSelect>>
```

By default, `SELECT` operations are assumed to return the same type as `GET`.
As this may differ by usecase (depending on the specific SQL query), it may be
overridden on a per-query basis.

## Parameters

`expr`

:   Query builder or string containing a SQL query expression &mdash; the
    easiest way to construct SQL queries that can be understood by SimpleDB is
    using the query builder which is implemented using [squel][1]. A query
    builder can be obtained using [`getQueryBuilder()`][2].

`prev`

:   Pagination token, *optional* &mdash; a `SELECT` operation returns a
    pagination token if there are more results to fetch, as SimpleDB uses
    token-based pagination. This token can then be passed to the same method
    using the same SQL query expression to obtain the next page of items.

  [1]: https://hiddentao.com/squel/
  [2]: get-query-builder.md

## Example

``` ts
let prev
do {
  const { items, next } = await isotopes.select(expr, prev)
  items.map(console.log)
  prev = next
} while (prev)
```
