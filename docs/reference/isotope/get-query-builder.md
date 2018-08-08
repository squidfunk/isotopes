# Isotope.getQueryBuilder

*Create an SQL query expression builder*

## Signature

``` ts
Isotope<T, TPut = T, TGet = T>.getQueryBuilder(): IsotopeSelect
```

This method returns an object of type [`IsotopeSelect`][1].

  [1]: ../isotope-select/new.md

## Parameters

none

## Example

``` ts
const expr = isotope.getQueryBuilder()
```
