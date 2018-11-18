# Isotope

*Create a SimpleDB domain client*

## Signature

``` ts
new Isotope<T, [TPut, [TGet]]>(
  options: IsotopeOptions<T>
): Isotope<T>
```

Initializes an isotope using the [given options][1] of which `domain` and `key`
are mandatory. The `format` option can be used to define the serialization
method that is used for the values before writing them to SimpleDB. The `client`
option enables configuration of the SimpleDB client.

  [1]: #parameters

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

The `DeepPartial` type is exported by *Isotopes*.

## Parameters

`options.domain`

:   SimpleDB domain name

`options.key`

:   SimpleDB item name (primary key)

`options.format.encoding`

:   Encoding method for values &mdash; *optional*, default: `"json"` &mdash;
    please see [this section][2] to learn how the available encoding methods
    `"json"` and `"text"` determine how values are written to SimpleDB.

`options.format.multiple`

:   Write multi-attribute values for arrays &mdash; *optional*, default: `true`
    &mdash; please see [this section][3] to learn how this will impact object
    flattening and persistence within SimpleDB.

`options.client.consistent`

:   Use consistent reads for `GET` and `SELECT` operations &mdash; *optional*,
    default: `false` &mdash; see the [official documentation][4] for further
    information on consistency within SimpleDB.

  [2]: ../../format/encoding.md
  [3]: ../../format/flattening.md
  [4]: https://docs.aws.amazon.com/de_de/AmazonSimpleDB/latest/DeveloperGuide/ConsistencySummary.html

## Example

``` ts
const isotope = new Isotope<T>({
  domain: "<domain>",
  key: "<keyof T>",

  /* Optional: format options */
  format: {
    encoding: "json",
    multiple: true
  },

  /* Optional: SimpleDB client options */
  client: {
    consistent: false
  }
})
```
