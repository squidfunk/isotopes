# Isotope.put

*Persists an item within SimpleDB*

## Signature

``` ts
Isotope<T, TPut = T, TGet = T>.put(data: TPut): Promise<void>
```

## Parameters

`data`

:   Data to be persisted &mdash; by default, partial data will trigger
    TypeScript errors due to the specified typings. In order to write partial
    data, *Isotopes* must be configured with `Partial<T>` or `DeepPartial<T>`
    for `TPut`, see [this section][1].

    Before delegating to SimpleDB, the keys of the data object are flattened and
    the values are encoded according to the method specified in
    `options.format.encoding` during initialization of the isotope.

  [1]: new.md
  [2]: ../format/encoding.md

## Example

``` ts
await isotope.put(data)
```
