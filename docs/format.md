# Format

## Encoding

The encoding can be set when creating the isotope, e.g.:

``` ts
const isotope = new Isotope<T>({
  format: { encoding: "text" },
  domain: "<domain>",
  key: "<keyof T>"
})
```

`options.format.encoding: "json"`

:   All values are JSON-encoded, which means that strings are double-quoted,
    whereas numbers and booleans are written literally:

    ``` json
    {
      "Name": "example",
      "Attributes": [
        { "Name": "active", "Value": "true" },
        { "Name": "props.image", "Value": "\"busybox\"" },
        { "Name": "props.cpus", "Value": "2" },
        { "Name": "props.memory", "Value": "2048" },
        { "Name": "tags[]", "Value": "\"TAG_1\"" },
        { "Name": "tags[]", "Value": "\"TAG_2\"" }
      ]
    }
    ```

    If you don't plan to use the SimpleDB domain from a non-*Isotope* client,
    you should always stick with JSON-encoding because it is more safe than
    text encoding and comes with no limitations.

`options.format.encoding: "text"`

:   *Isotopes* provides the ability to use an alternate encoding and store
    strings as literals so they are written without quotes:

    ``` json
    {
      "Name": "example",
      "Attributes": [
        { "Name": "active", "Value": "true" },
        { "Name": "props.image", "Value": "busybox" },
        { "Name": "props.cpus", "Value": "2" },
        { "Name": "props.memory", "Value": "2048" },
        { "Name": "tags[]", "Value": "TAG_1" },
        { "Name": "tags[]", "Value": "TAG_2" }
      ]
    }
    ```

    When decoding the data, we intercept `JSON.parse` assuming that we
    encountered a literal string if it fails to decode. It's a hack and yes,
    imposes some limitations:

    1. Numbers that are encoded as strings (e.g. house numbers, because they can
      exhibit values as `2A` etc.) are interpreted as numbers when decoded with
      `JSON.parse`. *Countermeasure*: ensure that numbers are typed as numbers,
      or string fields contain at least one non-number character.

    2. If strings accidentally contain valid JSON, e.g. `{}`, the value is
      parsed as JSON and the field gets assigned that precise value. This also
      breaks type safety. *Countermeasure*: ensure that your strings are never
      valid JSON by prepending some character that makes `JSON.parse` fail.

    As enforcing as those restrictions may seem to be, it is often true that
    the properties and characteristics of the data are known a-priori and those
    special cases can be ruled out with great certainty. This also means that
    querying the data from other parts of your system gets easier as string
    values don't need to be enclosed into quotes (and don't start thinking
    about `LIKE` queries) which is far more user-friendly.

## Flattening

*Isotopes* enables the storage of nested JSON objects within SimpleDB which
itself is a key-value store with the ability to query using SQL expressions.
In order to be compatible with SimpleDB, objects need to be flattened to match
the key-value nature of SimpleDB.

### Objects

Nested objects are flattened by concatenating the keys with `.` and associating
the value of the nested object's key with the concatenated path, e.g.:

``` json
{ "foo": { "bar": "baz" } }
```

becomes:

``` json
{ "Name": "foo.bar", "Value": "baz" }
```

### Arrays

There are two flavors for nested arrays, both with different use cases. Which
flavor is used is actually controlled using the `options.format.multiple`
option when creating the isotope:

`options.format.multiple = true` (default)

:   Array values are written as *separate attributes*. This is especially useful
    for arrays with primitive values (`string`, `number` and `boolean`) to
    enable indexing and queryability. Field names are suffixed with `[]` to
    indicate an array of values. However, note that **SimpleDB doesn't guarantee
    order of attributes**, so only use this if the order of the entries inside
    the array doesn't matter, e.g. for tagging:

    ``` json
    { "tags": ["TAG_1", "TAG_2"] }
    ```

    becomes:

    ``` json
    { "Name": "tags[]", "Value": "TAG_1" },
    { "Name": "tags[]", "Value": "TAG_2" }
    ```

`options.format.multiple = false`

:   Arrays are written as a *single attribute* using `"json"` encoding. While
    this guarantees the order of array values, it is certainly not possible to
    query for separate values using SQL expressions as they are encoded in JSON
    syntax, e.g.:

    ``` json
    { "tags": ["TAG_1", "TAG_2"] }
    ```

    becomes:

    ``` json
    { "Name": "tags", "Value": "[\"TAG_1\", \"TAG_2\"]" }
    ```

## Example

Assume we want to persist the type specified in the [getting started guide][1].

When persisting an object of this type with `multiple = true` and `"text"`
encoding, the flattened data that is persisted in SimpleDB will look like this:

``` json
{
  "Name": "example",
  "Attributes": [
    { "Name": "active", "Value": "true" },
    { "Name": "props.image", "Value": "busybox" },
    { "Name": "props.cpus", "Value": "2" },
    { "Name": "props.memory", "Value": "2048" },
    { "Name": "tags[]", "Value": "TAG_1" },
    { "Name": "tags[]", "Value": "TAG_2" }
  ]
}
```

  [1]: getting-started.md#usage
