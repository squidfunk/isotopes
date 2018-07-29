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
  IsotopeClient,
  IsotopeClientItem
} from "isotopes/client"
import { flatten } from "isotopes/format"

/* ----------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------- */

/**
 * Mock item
 *
 * @template T - Data type
 *
 * @param id - Identifier
 * @param data - Data to flatten
 *
 * @return Item
 */
export function mockIsotopeClientItem<T>(
  id: string, data: T
): IsotopeClientItem {
  return {
    id,
    attrs: flatten(data)
  }
}

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Mock IsotopeClient.get
 *
 * @param promise - Promise returned by client
 *
 * @return Jasmine spy
 */
function mockIsotopeClientGet<T>(
  promise: () => Promise<T>
): jasmine.Spy {
  return spyOn(IsotopeClient.prototype, "get")
    .and.callFake(promise)
}

/**
 * Mock IsotopeClient.get returning with result
 *
 * @param item - Item
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientGetWithResult(
  item: IsotopeClientItem
): jasmine.Spy {
  return mockIsotopeClientGet(() => Promise.resolve(item))
}

/**
 * Mock IsotopeClient.get returning without result
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientGetWithoutResult(): jasmine.Spy {
  return mockIsotopeClientGet(() => Promise.resolve(undefined))
}

/**
 * Mock IsotopeClient.get throwing an error
 *
 * @param err - Error to be thrown
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientGetWithError(
  err: Error = new Error("get")
): jasmine.Spy {
  return mockIsotopeClientGet(() => Promise.reject(err))
}

/* ------------------------------------------------------------------------- */

/**
 * Mock IsotopeClient.put
 *
 * @param promise - Promise returned by client
 *
 * @return Jasmine spy
 */
function mockIsotopeClientPut<T>(
  promise: () => Promise<T>
): jasmine.Spy {
  return spyOn(IsotopeClient.prototype, "put")
    .and.callFake(promise)
}

/**
 * Mock IsotopeClient.put returning with success
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientPutWithSuccess(): jasmine.Spy {
  return mockIsotopeClientPut(() => Promise.resolve())
}

/**
 * Mock IsotopeClient.put throwing an error
 *
 * @param err - Error to be thrown
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientPutWithError(
  err: Error = new Error("put")
): jasmine.Spy {
  return mockIsotopeClientPut(() => Promise.reject(err))
}

/* ------------------------------------------------------------------------- */

/**
 * Mock IsotopeClient.delete
 *
 * @param promise - Promise returned by client
 *
 * @return Jasmine spy
 */
function mockIsotopeClientDelete<T>(
  promise: () => Promise<T>
): jasmine.Spy {
  return spyOn(IsotopeClient.prototype, "delete")
    .and.callFake(promise)
}

/**
 * Mock IsotopeClient.delete returning with success
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientDeleteWithSuccess(): jasmine.Spy {
  return mockIsotopeClientDelete(() => Promise.resolve())
}

/**
 * Mock IsotopeClient.delete throwing an error
 *
 * @param err - Error to be thrown
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientDeleteWithError(
  err: Error = new Error("delete")
): jasmine.Spy {
  return mockIsotopeClientDelete(() => Promise.reject(err))
}

/* ------------------------------------------------------------------------- */

/**
 * Mock IsotopeClient.select
 *
 * @param promise - Promise returned by client
 *
 * @return Jasmine spy
 */
function mockIsotopeClientSelect<T>(
  promise: () => Promise<T>
): jasmine.Spy {
  return spyOn(IsotopeClient.prototype, "select")
    .and.callFake(promise)
}

/**
 * Mock IsotopeClient.select returning with result
 *
 * @param list - Item list
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientSelectWithResult(
  items: IsotopeClientItem[], next?: string
): jasmine.Spy {
  return mockIsotopeClientSelect(() => Promise.resolve({
    items, next
  }))
}

/**
 * Mock IsotopeClient.select returning without result
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientSelectWithoutResult(): jasmine.Spy {
  return mockIsotopeClientSelect(() => Promise.resolve({
    items: []
  }))
}

/**
 * Mock IsotopeClient.select throwing an error
 *
 * @param err - Error to be thrown
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientSelectWithError(
  err: Error = new Error("select")
): jasmine.Spy {
  return mockIsotopeClientSelect(() => Promise.reject(err))
}
