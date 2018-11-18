# IsotopeSelect.limit

*Add an LIMIT clause to a SQL query expression*

## Signature

``` ts
IsotopeSelect<T>.limit(
  count: number
): this
```

## Parameters

`count`

:   Number of records.

## Example

``` ts
// SELECT * FROM `domain` LIMIT 100
isotope.getQueryBuilder()
  .limit(100)
  .toString()
```
