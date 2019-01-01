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

import { range } from "lodash/fp"

import {
  Isotope,
  IsotopeOptions
} from "isotopes"
import { IsotopeClientItem } from "isotopes/client"
import { IsotopeSelect } from "isotopes/select"

import { chance } from "_/helpers"
import { Data, mockData } from "_/mocks/data"
import {
  mockIsotopeClientCreateWithError,
  mockIsotopeClientCreateWithSuccess,
  mockIsotopeClientDeleteWithError,
  mockIsotopeClientDeleteWithSuccess,
  mockIsotopeClientDestroyWithError,
  mockIsotopeClientDestroyWithSuccess,
  mockIsotopeClientGetWithError,
  mockIsotopeClientGetWithoutResult,
  mockIsotopeClientGetWithResult,
  mockIsotopeClientItem,
  mockIsotopeClientPutWithError,
  mockIsotopeClientPutWithSuccess,
  mockIsotopeClientSelectWithError,
  mockIsotopeClientSelectWithoutResult,
  mockIsotopeClientSelectWithResult
} from "_/mocks/isotopes/client"

/* ----------------------------------------------------------------------------
 * Tests
 * ------------------------------------------------------------------------- */

/* Isotope */
describe("isotopes", () => {

  /* Isotope */
  describe("Isotope", () => {

    /* Options */
    const options: IsotopeOptions<Data> = {
      domain: chance.string(),
      key: "id"
    }

    /* #create */
    describe("#create", () => {

      /* Test: should create isotope */
      it("should create isotope", async () => {
        const createMock = mockIsotopeClientCreateWithSuccess()
        const isotope = new Isotope(options)
        await isotope.create()
        expect(createMock).toHaveBeenCalled()
      })

      /* Test: should reject on client error */
      it("should reject on client error", async done => {
        const errMock = new Error()
        const createMock = mockIsotopeClientCreateWithError(errMock)
        try {
          const isotope = new Isotope(options)
          await isotope.create()
          done.fail()
        } catch (err) {
          expect(createMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })

    /* #destroy */
    describe("#destroy", () => {

      /* Test: should destroy isotope */
      it("should destroy isotope", async () => {
        const destroyMock = mockIsotopeClientDestroyWithSuccess()
        const isotope = new Isotope(options)
        await isotope.destroy()
        expect(destroyMock).toHaveBeenCalled()
      })

      /* Test: should reject on client error */
      it("should reject on client error", async done => {
        const errMock = new Error()
        const destroyMock = mockIsotopeClientDestroyWithError(errMock)
        try {
          const isotope = new Isotope(options)
          await isotope.destroy()
          done.fail()
        } catch (err) {
          expect(destroyMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })

    /* #getQueryBuilder */
    describe("#getQueryBuilder", () => {

      /* Test: should return an instance of query builder */
      it("should return an instance of query builder", () => {
        const isotope = new Isotope<Data>(options)
        expect(isotope.getQueryBuilder())
          .toEqual(jasmine.any(IsotopeSelect))
      })

      /* Test: should not return the same instance twice */
      it("should not return the same instance twice", () => {
        const isotope = new Isotope<Data>(options)
        expect(isotope.getQueryBuilder())
          .not.toBe(isotope.getQueryBuilder())
      })
    })

    /* #get */
    describe("#get", () => {

      /* Dummy item constructed from data */
      const data = mockData()
      const item = mockIsotopeClientItem(data.id, { random: data.random })

      /* Test: should resolve with item */
      it("should resolve with item", async () => {
        mockIsotopeClientGetWithResult(item)
        const isotope = new Isotope<Data>(options)
        expect(await isotope.get(data.id))
          .toEqual(data)
      })

      /* Test: should resolve non-existent item with undefined */
      it("should resolve non-existent item with undefined", async () => {
        mockIsotopeClientGetWithoutResult()
        const isotope = new Isotope<Data>(options)
        expect(await isotope.get(data.id))
          .toBeUndefined()
      })

      /* Test: should reject on client error */
      it("should reject on client error", async done => {
        const errMock = new Error()
        const getMock = mockIsotopeClientGetWithError(errMock)
        try {
          const isotope = new Isotope<Data>(options)
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

      /* Dummy data */
      const data = mockData()

      /* Test: should resolve with no result */
      it("should resolve with no result", async () => {
        mockIsotopeClientPutWithSuccess()
        const isotope = new Isotope<Data>(options)
        expect(await isotope.put(data))
          .toBeUndefined()
      })

      /* Test: should reject on missing identifier */
      it("should reject on missing identifier", async done => {
        try {
          const isotope = new Isotope<Data, Partial<Data>>(options)
          await isotope.put({})
          done.fail()
        } catch (err) {
          expect(err)
            .toEqual(new Error(`Invalid identifier: "id" not found`))
          done()
        }
      })

      /* Test: should reject on undefined identifier */
      it("should reject on undefined identifier", async done => {
        try {
          const isotope = new Isotope<Data, Partial<Data>>(options)
          await isotope.put({ id: undefined })
          done.fail()
        } catch (err) {
          expect(err)
            .toEqual(new Error(`Invalid identifier: "id" not found`))
          done()
        }
      })

      /* Test: should reject on client error */
      it("should reject on client error", async done => {
        const errMock = new Error()
        const putMock = mockIsotopeClientPutWithError(errMock)
        try {
          const isotope = new Isotope<Data>(options)
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

      /* Dummy identifier */
      const { id } = mockData()

      /* Test: should resolve with no result */
      it("should resolve with no result", async () => {
        mockIsotopeClientDeleteWithSuccess()
        const isotope = new Isotope<Data>(options)
        expect(await isotope.delete(id))
          .toBeUndefined()
      })

      /* Test: should reject on client error */
      it("should reject on client error", async done => {
        const errMock = new Error()
        const deleteMock = mockIsotopeClientDeleteWithError(errMock)
        try {
          const isotope = new Isotope<Data>(options)
          await isotope.delete(id)
          done.fail()
        } catch (err) {
          expect(deleteMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })

    /* #select */
    describe("#select", () => {

      /* SQL query expression and mock data */
      const expr = chance.string()
      const data = range(1, chance.integer({ min: 1, max: 10 }))
        .map<Data>(() => mockData())

      /* Pagination token and result */
      const token  = chance.string()
      const result = data.map<IsotopeClientItem>(({ id, random }) =>
        mockIsotopeClientItem(id, { random })
      )

      /* Test: should resolve with item list */
      it("should resolve with item list", async () => {
        mockIsotopeClientSelectWithResult(result)
        const isotope = new Isotope<Data>(options)
        const { items, next } = await isotope.select(expr)
        expect(items).toEqual(data)
        expect(next).toBeUndefined()
      })

      /* Test: should resolve with paginated item list */
      it("should resolve with paginated item list", async () => {
        const selectMock = mockIsotopeClientSelectWithResult(result)
        const isotope = new Isotope<Data>(options)
        const { items } = await isotope.select(expr, token)
        expect(items).toEqual(data)
        expect(selectMock).toHaveBeenCalledWith(expr, token)
      })

      /* Test: should resolve with pagination token */
      it("should resolve with pagination token", async () => {
        mockIsotopeClientSelectWithResult(result, token)
        const isotope = new Isotope<Data>(options)
        const { next } = await isotope.select(expr)
        expect(next).toEqual(token)
      })

      /* Test: should resolve non-match with empty item list */
      it("should resolve non-match with empty item list", async () => {
        mockIsotopeClientSelectWithoutResult()
        const isotope = new Isotope<Data>(options)
        const { items } = await isotope.select(expr)
        expect(items).toEqual([])
      })

      /* Test: should resolve non-match without pagination token */
      it("should resolve non-match without pagination token", async () => {
        mockIsotopeClientSelectWithoutResult()
        const isotope = new Isotope<Data>(options)
        const { next } = await isotope.select(expr)
        expect(next).toBeUndefined()
      })

      /* Test: should reject on client error */
      it("should reject on client error", async done => {
        const errMock = new Error()
        const selectMock = mockIsotopeClientSelectWithError(errMock)
        try {
          const isotope = new Isotope<Data>(options)
          await isotope.select(expr)
          done.fail()
        } catch (err) {
          expect(selectMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })
  })
})
