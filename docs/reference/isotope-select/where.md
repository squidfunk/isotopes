# IsotopeSelect.where

*Add a WHERE clause to a SELECT query expression*

## Signature

``` ts
IsotopeSelect<T>.where(
  condition: string,
  ...args: any[]
): this
```

## Parameters

`condition`

:   Condition expression &mdash; an expression can contain various placeholders,
    namely `?` which can be passed as variadic arguments. See the official AWS
    documentation on the [SimpleDB query language][1] in order to learn about
    the types of expressions that can be used in SQL queries or see
    [this section][2] for some usage examples. A brief overview:

    * [Comparison operators][3]
    * [Simple queries][4]
    * [Range queries][5]
    * [Queries on attributes with multiple values][6]
    * [Multiple attribute queries][7]

`...args`

:   Placeholder arguments which are replaced in the condition expression &mdash;
    note that string values are auto-quoted if the encoding is set to `"json"`.
    If the condition contains a `LIKE` expression, string values must include a
    `%` sign which is not quoted, so JSON values can also be searched.

  [1]: https://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/UsingSelect.html
  [2]: #example
  [3]: https://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/UsingSelectOperators.html
  [4]: https://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/SimpleQueriesSelect.html
  [5]: https://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/RangeQueriesSelect.html
  [6]: https://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/RangeValueQueriesSelect.html
  [7]: https://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/MultipleAttributeQueriesSelect.html

## Example

### `=`

``` ts tab="JSON encoding"
// SELECT * FROM `domain` WHERE (`key` = '"value"')
isotope.getQueryBuilder()
  .where("`key` = ?", "value")
  .toString()
```

``` ts tab="Text encoding"
// SELECT * FROM `domain` WHERE (`key` = 'value')
isotope.getQueryBuilder()
  .where("`key` = ?", "value")
  .toString()
```

### `LIKE`

``` ts tab="JSON encoding"
// SELECT * FROM `domain` WHERE (`key` LIKE '"value%')
isotope.getQueryBuilder()
  .where("`key` LIKE ?", "value%")
  .toString()
```

``` ts tab="Text encoding"
// SELECT * FROM `domain` WHERE (`key` LIKE 'value%')
isotope.getQueryBuilder()
  .where("`key` LIKE ?", "value%")
  .toString()
```

### `AND`

``` ts tab="JSON encoding"
// SELECT * FROM `domain` WHERE (`key` >= '1') AND (`key` <= '2')
isotope.getQueryBuilder()
  .where("`key` >= ?", 1)
  .where("`key` <= ?", 2)
  .toString()
```

``` ts tab="Text encoding"
// SELECT * FROM `domain` WHERE (`key` >= '1') AND (`key` <= '2')
isotope.getQueryBuilder()
  .where("`key` >= ?", 1)
  .where("`key` <= ?", 2)
  .toString()
```

### `OR`

``` ts tab="JSON encoding"
// SELECT * FROM `domain` WHERE (`key` = '1' OR `key` = '2')
isotope.getQueryBuilder()
  .where("`key` = ? OR `key` = ?", 1, 2)
  .toString()
```

``` ts tab="Text encoding"
// SELECT * FROM `domain` WHERE (`key` = '1' OR `key` = '2')
isotope.getQueryBuilder()
  .where("`key` = ? OR `key` = ?", 1, 2)
  .toString()
```
