# Isotope.create

*Create the SimpleDB domain*

## Signature

``` ts
Isotope<T, TPut = T, TGet = T>.create(): Promise<void>
```

*Isotopes* provides a thin wrapper around AWS SimpleDB domains which enables
storage and retrieval of typed hierarchical data, but it won't create or destroy
domains automatically. While this method will create a SimpleDB domain, it is
absolutely recommended to use [Terraform][1] for creation and destruction.

  [1]: https://terraform.io

## Parameters

none

## Example

``` ts
await isotope.create()
```
