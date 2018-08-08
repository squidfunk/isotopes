# Isotope

*Create a SimpleDB domain client*

## Signature

``` ts
new Isotope<T, [TPut, [TGet]]>(
  options: IsotopeOptions<T>
): Isotope<T>
```

Initializes an isotope using the given options of which `domain` and `key` are
mandatory. The `format` option can be used to define the serialization method
that is used for the values before writing them to SimpleDB. The `client` option
enables configuration of the SimpleDB client.

## Typings

By default, *Isotopes* forces only valid entries to be written to SimpleDB which
means that all non-optional fields need to be defined in the payload (otherwise
the TypeScript compiler will moan). However, SimpleDB allows reading and writing
of partial attribute values, so it might be desirable in some cases to loosen
that restriction and allow partial reads and writes. *Isotopes* allows both
configurations through simple generic typing.

``` ts
class Isotope<
  T    extends {},                     /* Data type */
  TPut extends DeepPartial<T> = T,     /* Data type expected by PUT operation */
  TGet extends DeepPartial<T> = TPut   /* Data type returned by GET operation */
> {}
```

The first type argument is mandatory and defines the base type. The second
and third type arguments can be used to specify what exact types `PUT` and `GET`
operations return but normally they are equal to the base type.

- Allow complete values only:

    ``` ts
    new Isotope<T>(...)
    ```

- Allow partial values in `PUT` and `GET` operations:

    ``` ts
    new Isotope<T, DeepPartial<T>>(...)
    ```

- Allow partial values in `GET` operations only:

    ``` ts
    new Isotope<T, T, DeepPartial<T>>(...)
    ```

## Parameters

`options.domain`

:   SimpleDB domain name

`options.key`

:   SimpleDB item name (primary key)

`options.format.encoding`

:   Encoding method for values &mdash; *optional* &mdash; please see
    [this section][1] to learn how the available encoding methods `"json"` and
    `"text"` determine how values are written to SimpleDB.

`options.format.multiple`

:   Write multi-attribute values for arrays &mdash; *optional*, default: `true`
    &mdash; this option controls whether arrays are split into separate
    attributes or encoded in a single attribute using `"json"` encoding. This
    is especially useful for arrays with primitive values (`string`, `number`
    and `boolean`) to enable indexing and queryability. If this option is set to
    `true`, field names are suffixed with `[]` to indicate an array of values.

`options.client.consistent`

:   Use consistent reads for `GET` and `SELECT` operations &mdash; *optional*,
    default: `false`

  [1]: ../format/encoding.md

## Example

``` ts
const isotope = new Isotope<T>({
  domain: "<domain>",
  key: "<keyof T>",

  /* Optional */
  format: {
    encoding: "json",
    multiple: true
  },

  /* Optional */
  client: {
    consistent: false
  }
})
```
