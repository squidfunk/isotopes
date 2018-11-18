# Isotope.delete

*Delete an item from SimpleDB*

## Signature

``` ts
Isotope<T, TPut = T, TGet = T>.delete(
  id: string,
  names?: string[]
): Promise<void>
```

This operation is idempotent, which means that executing the same operation
twice will always yield the same result.

  [1]: new.md

## Parameters

`id`

:   Identifier &mdash; unique value used for identification (SimpleDB item
    name).

`names`

:   Attribute names &mdash; *optional* &mdash; a set of flattened field names
    that should be deleted from SimpleDB. By providing attribute names, specific
    fields can be deleted keeping the item alive. If this parameter is omitted,
    the whole item is deleted.

## Example

``` ts
await isotope.delete(id)
```
