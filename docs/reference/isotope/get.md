# Isotope.get

*Retrieve an item from SimpleDB*

## Signature

``` ts
Isotope<T, TPut = T, TGet = T>.get(
  id: string,
  names?: string[]
): Promise<TGet | DeepPartial<TGet> | undefined>
```

Note that this method may return partial items if they are stored as such in
SimpleDB, so to obtain type safety with TypeScript, you have to make sure that
all items define all required fields before retrieving them from SimpleDB. If
unsure, it's best to configure *Isotopes* with `Partial<T>` or `DeepPartial<T>`
for `TGet`, see [this section][1].

  [1]: new.md

## Parameters

`id`

:   Identifier &mdash; unique value used for identification (SimpleDB item
    name).

`names`

:   Attribute names &mdash; *optional* &mdash; a set of flattened field names
    that should be retrieved from SimpleDB. If this parameter is omitted
    SimpleDB will return all attributes for a given item. If this parameter is
    specified, the Promise will resolve with a `DeepPartial<TGet>` type.

## Example

``` ts
const item = await isotope.get(id)
```
