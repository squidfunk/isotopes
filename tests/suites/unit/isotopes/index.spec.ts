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
  Isotope,
  IsotopeConfiguration
} from "isotopes"

import { chance } from "_/helpers"
import { Data, mockData } from "_/mocks/data"
import {
  mockIsotopeClientDeleteWithError,
  mockIsotopeClientDeleteWithSuccess,
  mockIsotopeClientGetWithError,
  mockIsotopeClientGetWithoutResult,
  mockIsotopeClientGetWithResult,
  mockIsotopeClientItem,
  mockIsotopeClientPutWithError,
  mockIsotopeClientPutWithSuccess,
} from "_/mocks/isotopes/client"

/* ----------------------------------------------------------------------------
 * Tests
 * ------------------------------------------------------------------------- */

/* Isotope */
describe("isotopes", () => {

  /* Isotope */
  describe("Isotope", () => {

    /* Client configuration */
    const config: IsotopeConfiguration<Data> = {
      domain: chance.string(),
      key: "id"
    }

    /* Dummy data */
    const data = mockData()

    /* #get */
    describe("#get", () => {

      /* Dummy item constructed from data */
      const item = mockIsotopeClientItem(data.id, { random: data.random })

      /* Test: should resolve with data (identifier and attributes) */
      it("should resolve with data (identifier and attributes)", async () => {
        mockIsotopeClientGetWithResult(item)
        const isotope = new Isotope<Data>(config)
        expect(await isotope.get(data.id))
          .toEqual(data)
      })

      /* Test: should resolve with undefined for non-existent item */
      it("should resolve with undefined for non-existent item", async () => {
        mockIsotopeClientGetWithoutResult()
        const isotope = new Isotope<Data>(config)
        expect(await isotope.get(data.id))
          .toBeUndefined()
      })

      /* Test: should reject on client error */
      it("should reject on client error", async done => {
        const errMock = new Error()
        const getMock = mockIsotopeClientGetWithError(errMock)
        try {
          const isotope = new Isotope(config)
          await isotope.get(data.id)
          done.fail()
        } catch (err) {
          expect(getMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })

    /* #put */
    describe("#put", () => {

      /* Test: should resolve with no result */
      it("should resolve with no result", async () => {
        mockIsotopeClientPutWithSuccess()
        const isotope = new Isotope<Data>(config)
        expect(await isotope.put(data))
          .toBeUndefined()
      })

      /* Test: should reject on client error */
      it("should reject on client error", async done => {
        const errMock = new Error()
        const putMock = mockIsotopeClientPutWithError(errMock)
        try {
          const isotope = new Isotope(config)
          await isotope.put(data)
          done.fail()
        } catch (err) {
          expect(putMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })

    /* #delete */
    describe("#delete", () => {

      /* Test: should resolve with no result */
      it("should resolve with no result", async () => {
        mockIsotopeClientDeleteWithSuccess()
        const isotope = new Isotope<Data>(config)
        expect(await isotope.delete(data.id))
          .toBeUndefined()
      })

      /* Test: should reject on client error */
      it("should reject on client error", async done => {
        const errMock = new Error()
        const deleteMock = mockIsotopeClientDeleteWithError(errMock)
        try {
          const isotope = new Isotope(config)
          await isotope.delete(data.id)
          done.fail()
        } catch (err) {
          expect(deleteMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })
  })
})
