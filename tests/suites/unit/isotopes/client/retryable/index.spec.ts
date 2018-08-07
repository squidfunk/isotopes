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

import { OperationOptions } from "retry"

import { retryable } from "isotopes/client/retryable"

import { mockAWSError } from "_/mocks/vendor/aws-sdk"

/* ----------------------------------------------------------------------------
 * Tests
 * ------------------------------------------------------------------------- */

/* Isotope client retry strategy */
describe("isotopes/client/retryable", () => {

  /* retryable */
  describe("retryable", () => {

    /* Retry strategy options */
    const options: OperationOptions = {
      minTimeout: 0,
      maxTimeout: 0,
      retries: 3,
      factor: 1
    }

    /* Test: should retry on AWS 5xx errors */
    it("should retry on AWS 5xx errors", async done => {
      const errMock = mockAWSError(500)
      const action = jasmine.createSpy("action")
        .and.returnValue(Promise.reject(errMock))
      try {
        await retryable(action, options)
        done.fail()
      } catch (err) {
        expect(action).toHaveBeenCalledTimes(4)
        expect(err).toBe(errMock)
        done()
      }
    })

    /* Test: should skip retry on AWS 4xx errors */
    it("should skip retry on AWS 4xx errors", async done => {
      const errMock = mockAWSError(400)
      const action = jasmine.createSpy("action")
        .and.returnValue(Promise.reject(errMock))
      try {
        await retryable(action, options)
        done.fail()
      } catch (err) {
        expect(action).toHaveBeenCalledTimes(1)
        expect(err).toBe(errMock)
        done()
      }
    })

    /* Test: should skip retry on non-AWS errors */
    it("should skip retry on non-AWS errors", async done => {
      const errMock = new Error()
      const action = jasmine.createSpy("action")
        .and.returnValue(Promise.reject(errMock))
      try {
        await retryable(action, options)
        done.fail()
      } catch (err) {
        expect(action).toHaveBeenCalledTimes(1)
        expect(err).toBe(errMock)
        done()
      }
    })
  })
})
