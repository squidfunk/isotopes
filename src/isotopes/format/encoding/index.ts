/*
 * Copyright (c) 2018 Martin Donath <martin.donath@squidfunk.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

/**
 * Isotope value
 */
export type IsotopeValue = string | number | boolean | object

/* ------------------------------------------------------------------------- */

/**
 * Isotope format encoding for values
 */
export type IsotopeFormatEncoding =
  | "json"                             /* Default JSON encoding */
  | "text"                             /* Strings are encoded as literals */

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Encode a value using the given encoding
 *
 * By default every field is formatted as JSON in order to ensure type
 * information not to be lost. However, this means that strings are actually
 * double-quoted which may not be desirable if the SimpleDB domain is also used
 * by other parts of your system as it cripples the querying experience.
 *
 * This library provides the ability to use an alternate encoding and store
 * strings as literals so they are written without quotes. When decoding the
 * data, we intercept JSON.parse assuming that we encountered a literal string
 * if it fails to decode. However, this imposes the following limitations:
 *
 * 1. Numbers that are encoded as strings (e.g. house numbers, because they can
 *    exhibit values as "2A" etc.) are interpreted as numbers when decoded with
 *    JSON.parse. Countermeasure: ensure that numbers are typed as numbers, or
 *    string fields contain at least one non-number character.
 *
 * 2. If strings accidentally contain valid JSON, e.g. "{}", the value is parsed
 *    as JSON and the field gets assigned that precise value. This also breaks
 *    type safety. Countermeasure: ensure that your strings are never valid JSON
 *    by prepending some character that makes JSON.parse fail.
 *
 * As enforcing as those restrictions may seem to be, it is often true that
 * the properties and characteristics of the data are known a-priori and those
 * special cases can be ruled out with great certainty. This also means that
 * querying the data from other parts of your system gets easier as string
 * values don't need to be enclosed into quotes (and don't start thinking about
 * LIKE queries) which is far more user-friendly.
 *
 * @internal
 *
 * @param value - Value to encode
 * @param encoding - Encoding
 *
 * @return Encoded value
 */
export function encode(
  value: IsotopeValue, encoding: IsotopeFormatEncoding
): string {
  return encoding === "json" || typeof value !== "string"
    ? JSON.stringify(value)
    : value
}

/**
 * Decode a value using the given encoding
 *
 * See the function documentation on flatten() for a detailed explanation on
 * how error handling is implemented and why.
 *
 * @internal
 *
 * @param value - Value to decode
 * @param encoding - Encoding
 *
 * @return Decoded value
 */
export function decode(
  value: string, encoding: IsotopeFormatEncoding
): IsotopeValue {
  try {
    return JSON.parse(value)
  } catch (err) {
    if (encoding === "text")
      return value
    throw err
  }
}
