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

import { Callback } from "aws-lambda"
import { SimpleDB } from "aws-sdk"
import { mock, restore } from "aws-sdk-mock"
import { toPairs } from "lodash"

import { IsotopeDictionary } from "isotopes/format"

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Mock SimpleDB.getAttributes
 *
 * @param spy - Spy/fake to mock SimpleDB
 *
 * @return Jasmine spy
 */
function mockSimpleDBGetAttributes(
  spy: jasmine.Spy
): jasmine.Spy {
  mock("SimpleDB", "getAttributes",
    (data: any, cb: Callback) => {
      cb(undefined, spy(data))
    })
  return spy
}

/**
 * Mock SimpleDB.getAttributes returning with result
 *
 * @param attrs - Attributes
 *
 * @return Jasmine spy
 */
export function mockSimpleDBGetAttributesWithResult(
  attrs?: IsotopeDictionary
): jasmine.Spy {
  return mockSimpleDBGetAttributes(
    jasmine.createSpy("getAttributes"))
      .and.returnValue({
        Attributes: toPairs(attrs)
          .map<SimpleDB.Attribute>(([key, value]) => ({
            Name: key,
            Value: value,
            Replace: true
          }))
      })
}

/**
 * Mock SimpleDB.getAttributes returning with result
 *
 * @return Jasmine spy
 */
export function mockSimpleDBGetAttributesWithoutResult(): jasmine.Spy {
  return mockSimpleDBGetAttributes(
    jasmine.createSpy("getAttributes"))
      .and.returnValue({})
}

/**
 * Mock SimpleDB.getAttributes throwing an error
 *
 * @param err - Error to be thrown
 *
 * @return Jasmine spy
 */
export function mockSimpleDBGetAttributesWithError(
  err: Error = new Error("getAttributes")
): jasmine.Spy {
  return mockSimpleDBGetAttributes(
    jasmine.createSpy("getAttributes")
      .and.callFake(() => { throw err }))
}

/**
 * Restore SimpleDB.getAttributes
 */
export function restoreSimpleDBGetAttributes() {
  restore("SimpleDB", "getAttributes")
}
