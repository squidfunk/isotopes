# Encoding

## JSON (recommended)

> `options.format.encoding: "json"`

All values are JSON-encoded, which means that strings are double-quoted,
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

If you don't plan to use the SimpleDB domain from a non-*Isotope* client, you
should always stick with JSON-encoding because it is more safe than text
encoding and comes with no limitations.

## Text

> `options.format.encoding: "text"`

*Isotopes* provides the ability to use an alternate encoding and store strings
as literals so they are written without quotes:

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

When decoding the data, we intercept `JSON.parse` assuming that we encountered
a literal string if it fails to decode. It's a hack and yes, imposes some
limitations:

1. Numbers that are encoded as strings (e.g. house numbers, because they can
   exhibit values as `2A` etc.) are interpreted as numbers when decoded with
   `JSON.parse`. *Countermeasure*: ensure that numbers are typed as numbers, or
   string fields contain at least one non-number character.

2. If strings accidentally contain valid JSON, e.g. `{}`, the value is parsed
   as JSON and the field gets assigned that precise value. This also breaks
   type safety. *Countermeasure*: ensure that your strings are never valid JSON
   by prepending some character that makes `JSON.parse` fail.

As enforcing as those restrictions may seem to be, it is often true that
the properties and characteristics of the data are known a-priori and those
special cases can be ruled out with great certainty. This also means that
querying the data from other parts of your system gets easier as string
values don't need to be enclosed into quotes (and don't start thinking about
`LIKE` queries) which is far more user-friendly.
