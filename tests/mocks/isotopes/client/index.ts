/*
 * Copyright (c) 2018-2020 Martin Donath <martin.donath@squidfunk.com>
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
  IsotopeClientItem,
  IsotopeClientItemList
} from "isotopes/client"
import { flatten } from "isotopes/format"

/* ----------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------- */

/**
 * Mock `IsotopeClientItem`
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
 * Mock `IsotopeClient.create`
 *
 * @param promise - Promise returned by client
 *
 * @return Jasmine spy
 */
function mockIsotopeClientCreate(
  promise: () => Promise<void>
): jasmine.Spy {
  return spyOn(IsotopeClient.prototype, "create")
    .and.callFake(promise)
}

/**
 * Mock `IsotopeClient.create` returning with result
 *
 * @param item - Item
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientCreateWithSuccess(): jasmine.Spy {
  return mockIsotopeClientCreate(() => Promise.resolve())
}

/**
 * Mock `IsotopeClient.create` throwing an error
 *
 * @param err - Error to be thrown
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientCreateWithError(
  err: Error = new Error("create")
): jasmine.Spy {
  return mockIsotopeClientCreate(() => Promise.reject(err))
}

/* ------------------------------------------------------------------------- */

/**
 * Mock `IsotopeClient.destroy`
 *
 * @param promise - Promise returned by client
 *
 * @return Jasmine spy
 */
function mockIsotopeClientDestroy(
  promise: () => Promise<void>
): jasmine.Spy {
  return spyOn(IsotopeClient.prototype, "destroy")
    .and.callFake(promise)
}

/**
 * Mock `IsotopeClient.destroy` returning with result
 *
 * @param item - Item
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientDestroyWithSuccess(): jasmine.Spy {
  return mockIsotopeClientDestroy(() => Promise.resolve())
}

/**
 * Mock `IsotopeClient.destroy` throwing an error
 *
 * @param err - Error to be thrown
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientDestroyWithError(
  err: Error = new Error("destroy")
): jasmine.Spy {
  return mockIsotopeClientDestroy(() => Promise.reject(err))
}

/* ------------------------------------------------------------------------- */

/**
 * Mock `IsotopeClient.get`
 *
 * @param promise - Promise returned by client
 *
 * @return Jasmine spy
 */
function mockIsotopeClientGet(
  promise: () => Promise<IsotopeClientItem | undefined>
): jasmine.Spy {
  return spyOn(IsotopeClient.prototype, "get")
    .and.callFake(promise)
}

/**
 * Mock `IsotopeClient.get` returning with result
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
 * Mock `IsotopeClient.get` returning without result
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientGetWithoutResult(): jasmine.Spy {
  return mockIsotopeClientGet(() => Promise.resolve(undefined))
}

/**
 * Mock `IsotopeClient.get` throwing an error
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
 * Mock `IsotopeClient.put`
 *
 * @param promise - Promise returned by client
 *
 * @return Jasmine spy
 */
function mockIsotopeClientPut(
  promise: () => Promise<void>
): jasmine.Spy {
  return spyOn(IsotopeClient.prototype, "put")
    .and.callFake(promise)
}

/**
 * Mock `IsotopeClient.put` returning with success
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientPutWithSuccess(): jasmine.Spy {
  return mockIsotopeClientPut(() => Promise.resolve())
}

/**
 * Mock `IsotopeClient.put` throwing an error
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
 * Mock `IsotopeClient.delete`
 *
 * @param promise - Promise returned by client
 *
 * @return Jasmine spy
 */
function mockIsotopeClientDelete(
  promise: () => Promise<void>
): jasmine.Spy {
  return spyOn(IsotopeClient.prototype, "delete")
    .and.callFake(promise)
}

/**
 * Mock `IsotopeClient.delete` returning with success
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientDeleteWithSuccess(): jasmine.Spy {
  return mockIsotopeClientDelete(() => Promise.resolve())
}

/**
 * Mock `IsotopeClient.delete` throwing an error
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
 * Mock `IsotopeClient.select`
 *
 * @param promise - Promise returned by client
 *
 * @return Jasmine spy
 */
function mockIsotopeClientSelect(
  promise: () => Promise<IsotopeClientItemList>
): jasmine.Spy {
  return spyOn(IsotopeClient.prototype, "select")
    .and.callFake(promise)
}

/**
 * Mock `IsotopeClient.select` returning with result
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
 * Mock `IsotopeClient.select` returning without result
 *
 * @return Jasmine spy
 */
export function mockIsotopeClientSelectWithoutResult(): jasmine.Spy {
  return mockIsotopeClientSelect(() => Promise.resolve({
    items: []
  }))
}

/**
 * Mock `IsotopeClient.select` throwing an error
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
