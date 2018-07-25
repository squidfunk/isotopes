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
import { toPairs } from "lodash"

import { IsotopeClient } from "isotopes/client"

import { chance } from "_/helpers"
import {
  mockSimpleDBDeleteAttributesWithError,
  mockSimpleDBDeleteAttributesWithSuccess,
  mockSimpleDBGetAttributesWithError,
  mockSimpleDBGetAttributesWithoutResult,
  mockSimpleDBGetAttributesWithResult,
  mockSimpleDBPutAttributesWithError,
  mockSimpleDBPutAttributesWithSuccess,
  restoreSimpleDBDeleteAttributes,
  restoreSimpleDBGetAttributes,
  restoreSimpleDBPutAttributes
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

    /* Record identifier and attributes */
    const id = chance.string()
    const attrs = {
      [chance.string()]: chance.string(),
      [chance.string()]: chance.string(),
      [chance.string()]: chance.string()
    }

    /* #get */
    describe("#get", () => {

      /* Restore AWS mocks */
      afterEach(() => {
        restoreSimpleDBGetAttributes()
      })

      /* Test: should resolve with identifier and attributes */
      it("should resolve with identifier and attributes", async () => {
        mockSimpleDBGetAttributesWithResult(attrs)
        const client = new IsotopeClient(domain)
        const item = await client.get(id)
        expect(item).toEqual({ id, attrs })
      })

      /* Test: should resolve with attributes for empty item */
      it("should resolve with empty attributes for empty item", async () => {
        mockSimpleDBGetAttributesWithResult()
        const client = new IsotopeClient(domain)
        const item = await client.get(id)
        expect(item).toEqual({ id, attrs: {} })
      })

      /* Test: should resolve with undefined for non-existent item */
      it("should resolve with undefined for non-existent item", async () => {
        mockSimpleDBGetAttributesWithoutResult()
        const client = new IsotopeClient(domain)
        const item = await client.get(id)
        expect(item).toBeUndefined()
      })

      /* Test: should pass attribute names to SimpleDB */
      it("should pass attribute names to SimpleDB", async () => {
        const getAttributesMock = mockSimpleDBGetAttributesWithResult()
        const client = new IsotopeClient(domain)
        await client.get(id, Object.keys(attrs))
        expect(getAttributesMock).toHaveBeenCalledWith({
          DomainName: domain,
          ItemName: id,
          AttributeNames: Object.keys(attrs)
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
            Attributes: toPairs(attrs)
              .map<SimpleDB.Attribute>(([key, value]) => ({
                Name: key,
                Value: value,
                Replace: true
              }))
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
  })
})
