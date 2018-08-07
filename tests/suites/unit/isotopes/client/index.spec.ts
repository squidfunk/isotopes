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

import { SimpleDB } from "aws-sdk"
import { range, toPairs } from "lodash/fp"

import {
  IsotopeClient,
  IsotopeClientItem,
  mapDictionaryToAttributes
} from "isotopes/client"

import { chance } from "_/helpers"
import { mockData } from "_/mocks/data"
import { mockIsotopeClientItem } from "_/mocks/isotopes/client"
import {
  mockSimpleDBCreateDomainWithError,
  mockSimpleDBCreateDomainWithSuccess,
  mockSimpleDBDeleteAttributesWithError,
  mockSimpleDBDeleteAttributesWithSuccess,
  mockSimpleDBDeleteDomainWithError,
  mockSimpleDBDeleteDomainWithSuccess,
  mockSimpleDBGetAttributesWithError,
  mockSimpleDBGetAttributesWithoutResult,
  mockSimpleDBGetAttributesWithResult,
  mockSimpleDBPutAttributesWithError,
  mockSimpleDBPutAttributesWithSuccess,
  mockSimpleDBSelectWithError,
  mockSimpleDBSelectWithoutResult,
  mockSimpleDBSelectWithResult,
  restoreSimpleDBCreateDomain,
  restoreSimpleDBDeleteAttributes,
  restoreSimpleDBDeleteDomain,
  restoreSimpleDBGetAttributes,
  restoreSimpleDBPutAttributes,
  restoreSimpleDBSelect
} from "_/mocks/vendor/aws-sdk"

/* ----------------------------------------------------------------------------
 * Tests
 * ------------------------------------------------------------------------- */

/* Isotope client */
describe("isotopes/client", () => {

  /* IsotopeClient */
  describe("IsotopeClient", () => {

    /* Client configuration */
    const domain = chance.string()

    /* #create */
    describe("#create", () => {

      /* Restore AWS mocks */
      afterEach(() => {
        restoreSimpleDBCreateDomain()
      })

      /* Test: should create domain */
      it("should create domain", async () => {
        const createDomainMock = mockSimpleDBCreateDomainWithSuccess()
        const client = new IsotopeClient(domain)
        await client.create()
        expect(createDomainMock).toHaveBeenCalled()
      })

      /* Test: should reject on AWS SimpleDB error */
      it("should reject on AWS SimpleDB error", async done => {
        const errMock = new Error()
        const createDomainMock = mockSimpleDBCreateDomainWithError(errMock)
        try {
          const client = new IsotopeClient(domain)
          await client.create()
          done.fail()
        } catch (err) {
          expect(createDomainMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })

    /* #destroy */
    describe("#destroy", () => {

      /* Restore AWS mocks */
      afterEach(() => {
        restoreSimpleDBDeleteDomain()
      })

      /* Test: should destroy domain */
      it("should destroy domain", async () => {
        const deleteDomainMock = mockSimpleDBDeleteDomainWithSuccess()
        const client = new IsotopeClient(domain)
        await client.destroy()
        expect(deleteDomainMock).toHaveBeenCalled()
      })

      /* Test: should reject on AWS SimpleDB error */
      it("should reject on AWS SimpleDB error", async done => {
        const errMock = new Error()
        const deleteDomainMock = mockSimpleDBDeleteDomainWithError(errMock)
        try {
          const client = new IsotopeClient(domain)
          await client.destroy()
          done.fail()
        } catch (err) {
          expect(deleteDomainMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })

    /* #get */
    describe("#get", () => {

      /* Data and item */
      const { id, random } = mockData()
      const { attrs } = mockIsotopeClientItem(id, random)

      /* Restore AWS mocks */
      afterEach(() => {
        restoreSimpleDBGetAttributes()
      })

      /* Test: should resolve with item with attributes */
      it("should resolve with item with attributes", async () => {
        mockSimpleDBGetAttributesWithResult(attrs)
        const client = new IsotopeClient(domain)
        const item = await client.get(id)
        expect(item).toEqual({ id, attrs })
      })

      /* Test: should resolve with item without attributes */
      it("should resolve with item without attributes", async () => {
        mockSimpleDBGetAttributesWithResult()
        const client = new IsotopeClient(domain)
        const item = await client.get(id)
        expect(item).toEqual({ id, attrs: {} })
      })

      /* Test: should resolve non-existent item with undefined */
      it("should resolve non-existent item with undefined", async () => {
        mockSimpleDBGetAttributesWithoutResult()
        const client = new IsotopeClient(domain)
        const item = await client.get(id)
        expect(item).toBeUndefined()
      })

      /* Test: should make consistent reads if enabled */
      it("should make consistent reads if enabled", async () => {
        const getAttributesMock = mockSimpleDBGetAttributesWithResult()
        const client = new IsotopeClient(domain, { consistent: true })
        await client.get(id, Object.keys(attrs))
        expect(getAttributesMock).toHaveBeenCalledWith({
          DomainName: domain,
          ItemName: id,
          AttributeNames: Object.keys(attrs),
          ConsistentRead: true
        })
      })

      /* Test: should pass attribute names to SimpleDB */
      it("should pass attribute names to SimpleDB", async () => {
        const getAttributesMock = mockSimpleDBGetAttributesWithResult()
        const client = new IsotopeClient(domain)
        await client.get(id, Object.keys(attrs))
        expect(getAttributesMock).toHaveBeenCalledWith({
          DomainName: domain,
          ItemName: id,
          AttributeNames: Object.keys(attrs),
          ConsistentRead: false
        })
      })

      /* Test: should reject on AWS SimpleDB error */
      it("should reject on AWS SimpleDB error", async done => {
        const errMock = new Error()
        const getAttributesMock = mockSimpleDBGetAttributesWithError(errMock)
        try {
          const client = new IsotopeClient(domain)
          await client.get(id)
          done.fail()
        } catch (err) {
          expect(getAttributesMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })

    /* #put */
    describe("#put", () => {

      /* Data and item */
      const { id, random } = mockData()
      const { attrs } = mockIsotopeClientItem(id, random)

      /* Restore AWS mocks */
      afterEach(() => {
        restoreSimpleDBPutAttributes()
      })

      /* Test: should resolve with no result */
      it("should resolve with no result", async () => {
        mockSimpleDBPutAttributesWithSuccess()
        const client = new IsotopeClient(domain)
        expect(await client.put(id, attrs))
          .toBeUndefined()
      })

      /* Test: should pass attribute key-value pairs to SimpleDB */
      it("should pass attribute key-value pairs to SimpleDB",
        async () => {
          const putAttributesMock = mockSimpleDBPutAttributesWithSuccess()
          const client = new IsotopeClient(domain)
          await client.put(id, attrs)
          expect(putAttributesMock).toHaveBeenCalledWith({
            DomainName: domain,
            ItemName: id,
            Attributes: mapDictionaryToAttributes(attrs)
          })
        })

      /* Test: should reject on AWS SimpleDB error */
      it("should reject on AWS SimpleDB error", async done => {
        const errMock = new Error()
        const putAttributesMock = mockSimpleDBPutAttributesWithError(errMock)
        try {
          const client = new IsotopeClient(domain)
          await client.put(id, attrs)
          done.fail()
        } catch (err) {
          expect(putAttributesMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })

    /* #delete */
    describe("#delete", () => {

      /* Data and item */
      const { id, random } = mockData()
      const { attrs } = mockIsotopeClientItem(id, random)

      /* Restore AWS mocks */
      afterEach(() => {
        restoreSimpleDBDeleteAttributes()
      })

      /* Test: should resolve with no result */
      it("should resolve with no result", async () => {
        mockSimpleDBDeleteAttributesWithSuccess()
        const client = new IsotopeClient(domain)
        expect(await client.delete(id))
          .toBeUndefined()
      })

      /* Test: should pass attribute names to SimpleDB */
      it("should pass attribute names to SimpleDB", async () => {
        const deleteAttributesMock = mockSimpleDBDeleteAttributesWithSuccess()
        const client = new IsotopeClient(domain)
        await client.delete(id, Object.keys(attrs))
        expect(deleteAttributesMock).toHaveBeenCalledWith({
          DomainName: domain,
          ItemName: id,
          Attributes: toPairs(attrs)
            .map<SimpleDB.DeletableAttribute>(([key]) => ({
              Name: key
            }))
        })
      })

      /* Test: should reject on AWS SimpleDB error */
      it("should reject on AWS SimpleDB error", async done => {
        const errMock = new Error()
        const deleteAttributesMock =
          mockSimpleDBDeleteAttributesWithError(errMock)
        try {
          const client = new IsotopeClient(domain)
          await client.delete(id)
          done.fail()
        } catch (err) {
          expect(deleteAttributesMock).toHaveBeenCalled()
          expect(err).toBe(errMock)
          done()
        }
      })
    })

    /* #select */
    describe("#select", () => {

      /* SQL query expression */
      const expr = chance.string()

      /* Pagination token and result */
      const token  = chance.string()
      const result = range(0, chance.integer({ min: 1, max: 10 }))
        .map<IsotopeClientItem>(() => {
          const { id, random } = mockData()
          return mockIsotopeClientItem(id, random)
        })

      /* Restore AWS mocks */
      afterEach(() => {
        restoreSimpleDBSelect()
      })

      /* Test: should resolve with item list */
      it("should resolve with item list", async () => {
        mockSimpleDBSelectWithResult(result)
        const client = new IsotopeClient(domain)
        const { items } = await client.select(expr)
        expect(items).toEqual(result)
      })

      /* Test: should resolve with pagination token if given */
      it("should resolve with pagination token if given", async () => {
        mockSimpleDBSelectWithResult(result, token)
        const client = new IsotopeClient(domain)
        const { next } = await client.select(expr)
        expect(next).toEqual(token)
      })

      /* Test: should resolve without pagination token */
      it("should resolve without pagination token", async () => {
        mockSimpleDBSelectWithResult(result)
        const client = new IsotopeClient(domain)
        const { next } = await client.select(expr)
        expect(next).toBeUndefined()
      })

      /* Test: should resolve non-match with empty item list */
      it("should resolve non-match with empty item list", async () => {
        mockSimpleDBSelectWithoutResult()
        const client = new IsotopeClient(domain)
        const { items } = await client.select(expr)
        expect(items).toEqual([])
      })

      /* Test: should resolve non-match without pagination token */
      it("should resolve non-match without pagination token", async () => {
        mockSimpleDBSelectWithoutResult()
        const client = new IsotopeClient(domain)
        const { next } = await client.select(expr)
        expect(next).toBeUndefined()
      })

      /* Test: should make consistent reads if enabled */
      it("should make consistent reads if enabled", async () => {
        const selectMock = mockSimpleDBSelectWithResult(result)
        const client = new IsotopeClient(domain, { consistent: true })
        await client.select(expr, token)
        expect(selectMock).toHaveBeenCalledWith({
          SelectExpression: expr,
          NextToken: token,
          ConsistentRead: true
        })
      })

      /* Test: should reject on AWS SimpleDB error */
      it("should reject on AWS SimpleDB error", async done => {
        const errMock = new Error()
        const selectMock = mockSimpleDBSelectWithError(errMock)
        try {
          const client = new IsotopeClient(domain)
          await client.select(chance.string())
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
