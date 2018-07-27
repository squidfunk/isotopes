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

import { IsotopeOptions } from "isotopes"
import { IsotopeSelect } from "isotopes/select"

import { Data } from "_/mocks/data"

/* ----------------------------------------------------------------------------
 * Tests
 * ------------------------------------------------------------------------- */

/* Isotope select */
describe("isotopes/select", () => {

  /* IsotopeSelect */
  describe("IsotopeSelect", () => {

    /* Test: should return all items by default */
    it("should return all items by default", () => {
      const select = new IsotopeSelect({
        domain: "domain",
        key: "id"
      })
      expect(select.toString())
        .toEqual("SELECT * FROM `domain`")
    })

    /* #where */
    describe("#where", () => {

      /* with JSON format */
      describe("with JSON format", () => {

        /* Options */
        const options: IsotopeOptions<Data> = {
          domain: "domain",
          key: "id"
        }

        /* Test: should set quoted string values in exact conditions */
        it("should set quoted string values in exact conditions", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` = ?", "bar")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` = '\"bar\"')")
        })

        /* Test: should set quoted string values in prefix queries */
        it("should set quoted string values in prefix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` LIKE ?", "bar%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` LIKE '\"bar%')")
        })

        /* Test: should set quoted string values in prefix queries */
        it("should set quoted string values in prefix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` LIKE ?", "%bar")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` LIKE '%bar\"')")
        })

        /* Test: should set quoted string values in infix queries */
        it("should set quoted string values in infix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` LIKE ?", "%bar%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` LIKE '%bar%')")
        })

        /* Test: should set quoted string values in infix queries */
        it("should set quoted string values in infix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` LIKE ?", "%bar%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` LIKE '%bar%')")
        })

        /* Test: should set literal numeric values */
        it("should set literal numeric values", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` = ?", 10)
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` = '10')")
        })

        /* Test: should set literal boolean values */
        it("should set literal boolean values", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` = ?", true)
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` = 'true')")
        })

        /* Test: should set serialized array values */
        it("should set serialized array values", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` = ?", ["bar"])
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` = '[\"bar\"]')")
        })
      })

      /* with text format */
      describe("with text format", () => {

        /* Options */
        const options: IsotopeOptions<Data> = {
          format: { encoding: "text" },
          domain: "domain",
          key: "id"
        }

        /* Test: should set literal string values in exact conditions */
        it("should set literal string values in exact conditions", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` = ?", "bar")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` = 'bar')")
        })

        /* Test: should set literal string values in prefix queries */
        it("should set literal string values in prefix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` LIKE ?", "bar%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` LIKE 'bar%')")
        })

        /* Test: should set literal string values in prefix queries */
        it("should set literal string values in prefix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` LIKE ?", "%bar")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` LIKE '%bar')")
        })

        /* Test: should set literal string values in infix queries */
        it("should set literal string values in infix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` LIKE ?", "%bar%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` LIKE '%bar%')")
        })

        /* Test: should set literal string values in infix queries */
        it("should set literal string values in infix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` LIKE ?", "%bar%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` LIKE '%bar%')")
        })

        /* Test: should set literal numeric values */
        it("should set literal numeric values", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` = ?", 10)
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` = '10')")
        })

        /* Test: should set literal boolean values */
        it("should set literal boolean values", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` = ?", true)
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` = 'true')")
        })

        /* Test: should set serialized array values */
        it("should set serialized array values", () => {
          const select = new IsotopeSelect(options)
            .where("`foo` = ?", ["bar"])
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`foo` = '[\"bar\"]')")
        })
      })
    })
  })
})
