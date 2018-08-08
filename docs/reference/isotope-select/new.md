# IsotopeSelect

*Create a SQL query expression builder*

## Signature

``` ts
new IsotopeSelect<T]>(
  options: IsotopeOptions<T>,
): Isotope<T>
```

The query builder should not be instantiated manually. It's better to use
[Isotope.getQueryBuilder][1] because the isotope will pass its options to the
constructor.

  [1]: ../isotope/get-query-builder.md

## Parameters

`options`

:   Same as the options passed to the isotope constructor, see [here][2].

  [2]: ../isotope/new.md#parameters

## Example

``` ts
const expr = isotope.getQueryBuilder()
```
