# IsotopeSelect.order

*Add an ORDER BY clause to a SELECT query expression*

## Signature

``` ts
IsotopeSelect<T>.order(
  field: string,
  direction?: "asc" | "desc"
): this
```

## Parameters

`field`

:   Sort field

`direction`

:   Sort direction &mdash; *optional*, default: `"asc"`

## Example

``` ts
// SELECT * FROM `domain` ORDER BY `key` ASC
isotope.getQueryBuilder()
  .order("`key`")
  .toString()
```
