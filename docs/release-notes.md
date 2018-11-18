# Release notes

## Upgrading

To upgrade *Isotopes* to the latest version, use `npm`:

``` sh
npm update isotopes
```

## Changelog

### 0.5.0 <small>_ August 7, 2018</small>

* Removed retryability implementation (AWS SDK provides it)

### 0.4.2 <small>_ August 7, 2018</small>

* Fixed failing delete operation without attribute names

### 0.4.1 <small>_ August 7, 2018</small>

* Added missing typings to dependencies

### 0.4.0 <small>_ August 5, 2018</small>

* Added fault-tolerance (retryability) to all SimpleDB client requests

### 0.3.2 <small>_ August 2, 2018</small>

* Added runtime check to `Isotope.put` for presence of item name
* Added comments to TypeScript annotations
* Fixed generic partial types to be too shallow

### 0.3.2 <small>_ August 1, 2018</small>

* Added utility types for recursively making types all optional or required

### 0.3.1 <small>_ July 30, 2018</small>

* Fixed handling of undefined values in `WHERE` clauses

### 0.3.0 <small>_ July 30, 2018</small>

* Added support for domain creation and destruction
* Refactored result to return token value instead of function

### 0.2.0 <small>_ July 29, 2018</small>

* Added support for multi-attribute values

### 0.1.1 <small>_ July 27, 2018</small>

* Fixed entrypoint and typings

### 0.1.0 <small>_ July 27, 2018</small>

* Initial release
