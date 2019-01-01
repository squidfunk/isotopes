/*
 * Copyright (c) 2018-2019 Martin Donath <martin.donath@squidfunk.com>
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
import { mock, restore } from "aws-sdk-mock"

import {
  IsotopeClientItem,
  mapDictionaryToAttributes
} from "isotopes/client"

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Mock `SimpleDB.select`
 *
 * @param spy - Spy/fake to mock SimpleDB
 *
 * @return Jasmine spy
 */
function mockSimpleDBSelect(
  spy: jasmine.Spy
): jasmine.Spy {
  mock("SimpleDB", "select",
    (data: any, cb: Callback) => {
      cb(undefined, spy(data))
    })
  return spy
}

/**
 * Mock `SimpleDB.select` returning with result
 *
 * @param items - Items
 * @param next - Token for pagination
 *
 * @return Jasmine spy
 */
export function mockSimpleDBSelectWithResult(
  items: IsotopeClientItem[], next?: string
): jasmine.Spy {
  return mockSimpleDBSelect(
    jasmine.createSpy("select"))
      .and.returnValue({
        Items: items.map(({ id, attrs }) => ({
          Name: id,
          Attributes: mapDictionaryToAttributes(attrs)
        })),
        NextToken: next
      })
}

/**
 * Mock `SimpleDB.select` returning without result
 *
 * @return Jasmine spy
 */
export function mockSimpleDBSelectWithoutResult(): jasmine.Spy {
  return mockSimpleDBSelect(
    jasmine.createSpy("select"))
      .and.returnValue({})
}

/**
 * Mock `SimpleDB.select` throwing an error
 *
 * @param err - Error to be thrown
 *
 * @return Jasmine spy
 */
export function mockSimpleDBSelectWithError(
  err: Error = new Error("select")
): jasmine.Spy {
  return mockSimpleDBSelect(
    jasmine.createSpy("select")
      .and.callFake(() => { throw err }))
}

/**
 * Restore `SimpleDB.select`
 */
export function restoreSimpleDBSelect() {
  restore("SimpleDB", "select")
}
