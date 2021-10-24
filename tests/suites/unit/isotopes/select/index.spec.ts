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

import { IsotopeOptions } from "isotopes"
import { IsotopeSelect } from "isotopes/select"
import squel from "squel"

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

      /* with default encoding */
      describe("with default encoding", () => {

        /* Options */
        const options: IsotopeOptions<Data> = {
          domain: "domain",
          key: "id"
        }

        /* Test: should set quoted string values in exact conditions */
        it("should set quoted string values in exact conditions", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?", "y")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` = '\"y\"')")
        })

        /* Test: should set quoted string values in prefix queries */
        it("should set quoted string values in prefix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`x` LIKE ?", "y%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` LIKE '\"y%')")
        })

        /* Test: should set quoted string values in suffix queries */
        it("should set quoted string values in suffix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`x` LIKE ?", "%y")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` LIKE '%y\"')")
        })

        /* Test: should set quoted string values in infix queries */
        it("should set quoted string values in infix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`x` LIKE ?", "%y%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` LIKE '%y%')")
        })

        /* Test: should set quoted string values in infix queries */
        it("should set quoted string values in infix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`x` LIKE ?", "%y%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` LIKE '%y%')")
        })

        /* Test: should set literal numeric values */
        it("should set literal numeric values", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?", 10)
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` = '10')")
        })

        /* Test: should set literal boolean values */
        it("should set literal boolean values", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?", true)
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` = 'true')")
        })

        /* Test: should set serialized object values */
        it("should set serialized object values", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?", { y: "z" })
          expect(select.toString())
            .toEqual(
              "SELECT * FROM `domain` WHERE (`x` = '{\"y\":\"z\"}')"
            )
        })

        /* Test: should set serialized array values */
        it("should set serialized array values", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?", ["y"])
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` = '[\"y\"]')")
        })

        /* Test: should set undefined values */
        it("should set undefined values", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` = 'undefined')")
        })
      })

      /* with text encoding */
      describe("with text encoding", () => {

        /* Options */
        const options: IsotopeOptions<Data> = {
          format: { encoding: "text" },
          domain: "domain",
          key: "id"
        }

        /* Test: should set literal string values in exact conditions */
        it("should set literal string values in exact conditions", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?", "y")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` = 'y')")
        })

        /* Test: should set literal string values in prefix queries */
        it("should set literal string values in prefix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`x` LIKE ?", "y%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` LIKE 'y%')")
        })

        /* Test: should set literal string values in prefix queries */
        it("should set literal string values in prefix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`x` LIKE ?", "%y")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` LIKE '%y')")
        })

        /* Test: should set literal string values in infix queries */
        it("should set literal string values in infix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`x` LIKE ?", "%y%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` LIKE '%y%')")
        })

        /* Test: should set literal string values in infix queries */
        it("should set literal string values in infix queries", () => {
          const select = new IsotopeSelect(options)
            .where("`x` LIKE ?", "%y%")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` LIKE '%y%')")
        })

        /* Test: should set literal numeric values */
        it("should set literal numeric values", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?", 10)
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` = '10')")
        })

        /* Test: should set literal boolean values */
        it("should set literal boolean values", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?", true)
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` = 'true')")
        })

        /* Test: should set literal boolean values */
        it("should set serialized object values", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?", { y: "z" })
          expect(select.toString())
            .toEqual(
              "SELECT * FROM `domain` WHERE (`x` = '{\"y\":\"z\"}')"
            )
        })

        /* Test: should set serialized array values */
        it("should set serialized array values", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?", ["y"])
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` = '[\"y\"]')")
        })

        /* Test: should set undefined values */
        it("should set undefined values", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ?")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`x` = 'undefined')")
        })
      })

      describe("with defined type in options", () => {

        /* Options */
        const options: IsotopeOptions<Data> = {
          domain: "domain",
          key: "id",
          type: "type"
        }

        it("should add __isotype_type filter to clause", () => {
          const select = new IsotopeSelect(options)
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`__isotopes_type` = '\"type\"')")
        })

        it("should append supplied string predicate with AND", () => {
          const select = new IsotopeSelect(options)
            .where("`x` = ? or `y` = ?")
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`__isotopes_type` = '\"type\"') AND (`x` = 'undefined' or `y` = 'undefined')")
        })

        it("should append supplied expression prediciate with AND", () => {
          const predicate = squel.expr()
            .and('`x` = ?')
            .or('`y` = ?')
          const select = new IsotopeSelect(options)
            .where(predicate)
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`__isotopes_type` = '\"type\"') AND (`x` = 'undefined' OR `y` = 'undefined')")
        })

        it("should append supplied expression prediciate with AND (ignores first OR)", () => {
          const predicate = squel.expr()
            .or('`x` = ?')
            .or('`y` = ?')
          const select = new IsotopeSelect(options)
            .where(predicate)
          expect(select.toString())
            .toEqual("SELECT * FROM `domain` WHERE (`__isotopes_type` = '\"type\"') AND (`x` = 'undefined' OR `y` = 'undefined')")
        })
      })
    })

    /* #order */
    describe("#order", () => {

      /* Options */
      const options: IsotopeOptions<Data> = {
        domain: "domain",
        key: "id"
      }

      /* Test: should return items in ascending order by default */
      it("should return items in ascending order by default", () => {
        const select = new IsotopeSelect(options)
          .order("`x`")
        expect(select.toString())
          .toEqual("SELECT * FROM `domain` ORDER BY `x` ASC")
      })

      /* Test: should order items ascending */
      it("should return items in ascending order", () => {
        const select = new IsotopeSelect(options)
          .order("`x`", "asc")
        expect(select.toString())
          .toEqual("SELECT * FROM `domain` ORDER BY `x` ASC")
      })

      /* Test: should order items descending */
      it("should return items in descending order", () => {
        const select = new IsotopeSelect(options)
          .order("`x`", "desc")
        expect(select.toString())
          .toEqual("SELECT * FROM `domain` ORDER BY `x` DESC")
      })
    })

    /* #limit */
    describe("#limit", () => {

      /* Options */
      const options: IsotopeOptions<Data> = {
        domain: "domain",
        key: "id"
      }

      /* Test: should limit the number of items returned */
      it("should limit the number of items returned", () => {
        const select = new IsotopeSelect(options)
          .limit(100)
        expect(select.toString())
          .toEqual("SELECT * FROM `domain` LIMIT 100")
      })
    })
  })
})
