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

import {
  isArray,
  isPlainObject,
  set,
  toPairs
} from "lodash/fp"

import {
  decode,
  encode,
  IsotopeFormatEncoding
} from "./encoding"

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

/**
 * Isotope dictionary
 */
export interface IsotopeDictionary {
  [key: string]: string | string[]     /* Key-value pairs */
}

/* ------------------------------------------------------------------------- */

/**
 * Isotope format options
 */
export interface IsotopeFormatOptions {
  encoding?: IsotopeFormatEncoding     /* Format encoding */
  multiple?: boolean                   /* Multi-attribute values for arrays */
}

/* ----------------------------------------------------------------------------
 * Values
 * ------------------------------------------------------------------------- */

/**
 * Default format options
 */
const defaultOptions: Required<IsotopeFormatOptions> = {
  encoding: "json",
  multiple: true
}

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Flatten data into a dictionary
 *
 * @template T - Data type
 *
 * @param data - Data to flatten and encode
 * @param options - Format options
 * @param path - Path prefix to prepend to name
 *
 * @return Encoded dictionary
 */
export function flatten<T extends {}>(
  data: T, options: Partial<IsotopeFormatOptions> = {}, path: string[] = []
): IsotopeDictionary {
  const { encoding, multiple } = { ...defaultOptions, ...options }
  return toPairs(data)
    .reduce<IsotopeDictionary>((dict, [name, value]) => {

      /* Recurse on objects and add name to prefix path */
      if (isPlainObject(value)) {
        return {
          ...dict,
          ...flatten(value, { encoding, multiple }, [...path, name])
        }

      /* Encode array values separately */
      } else if (multiple && isArray(value)) {
        return {
          ...dict,
          [[...path, name + "[]"].join(".")]: value.map(entry =>
            encode(entry, encoding)
          )
        }

      /* Encode all other values */
      } else {
        return {
          ...dict,
          [[...path, name].join(".")]: encode(value, encoding)
        }
      }
    }, {})
}

/**
 * Unflatten an encoded dictionary
 *
 * @template T - Data type
 *
 * @param dict - Dictionary to unflatten and decode
 * @param options - Format options
 *
 * @return Decoded data
 */
export function unflatten<T extends {}>(
  dict: IsotopeDictionary, options: Partial<IsotopeFormatOptions> = {}
): T {
  const { encoding } = { ...defaultOptions, ...options }
  return toPairs(dict)
    .reduce<T>((data, [name, value]) => {

      /* Handle all array values separately */
      if (isArray(value)) {
        return set(name.replace(/\[\]$/, ""), value.map(entry =>
          decode(entry, encoding)
        ), data)

      /* Decode all other values */
      } else {
        return set(name, decode(value, encoding), data)
      }
    }, {} as any)
}
