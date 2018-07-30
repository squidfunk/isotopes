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
  flatten,
  IsotopeFormatOptions,
  unflatten
} from "isotopes/format"

import { chance } from "_/helpers"

/* ----------------------------------------------------------------------------
 * Tests
 * ------------------------------------------------------------------------- */

/* Isotope formatting utilities */
describe("isotopes/format", () => {

  /* flatten */
  describe("flatten", () => {

    /* Test: should flatten nested values */
    it("should flatten nested values", () => {
      const data = { x: { y: { z: chance.string() } } }
      expect(Object.keys(flatten(data)))
        .toEqual(["x.y.z"])
    })

    /* Test: should write quoted string values */
    it("should write quoted string values", () => {
      const data = { x: { y: chance.string() } }
      expect(flatten(data)).toEqual({
        "x.y": JSON.stringify(data.x.y)
      })
    })

    /* Test: should write literal numeric values */
    it("should write literal numeric values", () => {
      const data = { x: { y: chance.integer() } }
      expect(flatten(data)).toEqual({
        "x.y": JSON.stringify(data.x.y)
      })
    })

    /* Test: should write literal boolean values */
    it("should write literal boolean values", () => {
      const data = { x: { y: chance.bool() } }
      expect(flatten(data)).toEqual({
        "x.y": JSON.stringify(data.x.y)
      })
    })

    /* with text encoding */
    describe("with text encoding", () => {

      /* Format options */
      const options: IsotopeFormatOptions = {
        encoding: "text"
      }

      /* Test: should write literal string values */
      it("should write literal string values", () => {
        const data = { x: { y: chance.string() } }
        expect(flatten(data, options)).toEqual({
          "x.y": data.x.y
        })
      })

      /* Test: should write literal numeric values */
      it("should write literal numeric values", () => {
        const data = { x: { y: chance.integer() } }
        expect(flatten(data, options)).toEqual({
          "x.y": data.x.y.toString()
        })
      })

      /* Test: should write literal boolean values */
      it("should write literal boolean values", () => {
        const data = { x: { y: chance.bool() } }
        expect(flatten(data, options)).toEqual({
          "x.y": data.x.y.toString()
        })
      })
    })

    /* with multiple attributes */
    describe("with multiple attributes", () => {

      /* Test: should write array with string values */
      it("should write array with string values", () => {
        const data = { x: { y: [chance.string(), chance.string()] } }
        expect(flatten(data)).toEqual({
          "x.y[]": data.x.y.map(item => JSON.stringify(item))
        })
      })

      /* Test: should write array with numeric values */
      it("should write array with numeric values", () => {
        const data = { x: { y: [chance.integer(), chance.integer()] } }
        expect(flatten(data)).toEqual({
          "x.y[]": data.x.y.map(item => JSON.stringify(item))
        })
      })

      /* Test: should write array with boolean values */
      it("should write array with boolean values", () => {
        const data = { x: { y: [chance.bool(), chance.bool()] } }
        expect(flatten(data)).toEqual({
          "x.y[]": data.x.y.map(item => JSON.stringify(item))
        })
      })

      /* Test: should write array with object values */
      it("should write array with object values", () => {
        const data = { x: { y: [{ c: chance.string() }] } }
        expect(flatten(data)).toEqual({
          "x.y[]": data.x.y.map(item => JSON.stringify(item))
        })
      })
    })

    /* with single attributes */
    describe("with single attributes", () => {

      /* Format options */
      const options: IsotopeFormatOptions = {
        encoding: "text",
        multiple: false
      }

      /* Test: should write array with string values */
      it("should write array with string values", () => {
        const data = { x: { y: [chance.string(), chance.string()] } }
        expect(flatten(data, options)).toEqual({
          "x.y": JSON.stringify(data.x.y)
        })
      })

      /* Test: should write array with numeric values */
      it("should write array with numeric values", () => {
        const data = { x: { y: [chance.integer(), chance.integer()] } }
        expect(flatten(data, options)).toEqual({
          "x.y": JSON.stringify(data.x.y)
        })
      })

      /* Test: should write array with boolean values */
      it("should write array with boolean values", () => {
        const data = { x: { y: [chance.bool(), chance.bool()] } }
        expect(flatten(data, options)).toEqual({
          "x.y": JSON.stringify(data.x.y)
        })
      })

      /* Test: should write array with object values */
      it("should write array with object values", () => {
        const data = { x: { y: [{ c: chance.string() }] } }
        expect(flatten(data, options)).toEqual({
          "x.y": JSON.stringify(data.x.y)
        })
      })
    })
  })

  /* unflatten */
  describe("unflatten", () => {

    /* Test: should unflatten nested values */
    it("should unflatten nested values", () => {
      const data = { "x.y.c": "{}" }
      expect(unflatten(data)).toEqual({
        x: { y: { c: {} } }
      })
    })

    /* Test: should read quoted string values */
    it("should read quoted string values", () => {
      const data = { "x.y": JSON.stringify(chance.string()) }
      expect(unflatten(data)).toEqual({
        x: { y: JSON.parse(data["x.y"]) }
      })
    })

    /* Test: should read literal numeric values */
    it("should read literal numeric values", () => {
      const data = { "x.y": JSON.stringify(chance.integer()) }
      expect(unflatten(data)).toEqual({
        x: { y: JSON.parse(data["x.y"]) }
      })
    })

    /* Test: should read literal boolean values */
    it("should read literal boolean values", () => {
      const data = { "x.y": JSON.stringify(chance.bool()) }
      expect(unflatten(data)).toEqual({
        x: { y: JSON.parse(data["x.y"]) }
      })
    })

    /* Test: should throw on invalid JSON */
    it("should throw on invalid JSON", () => {
      const data = { "x.y": chance.string() }
      expect(() => {
        unflatten(data)
      }).toThrowError()
    })

    /* with text encoding */
    describe("with text encoding", () => {

      /* Format options */
      const options: IsotopeFormatOptions = {
        encoding: "text"
      }

      /* Test: should read literal string values */
      it("should read literal string values", () => {
        const data = { "x.y": chance.string() }
        expect(unflatten(data, options)).toEqual({
          x: { y: data["x.y"] }
        })
      })

      /* Test: should read literal numeric values */
      it("should read literal numeric values", () => {
        const data = { "x.y": JSON.stringify(chance.integer()) }
        expect(unflatten(data, options)).toEqual({
          x: { y: JSON.parse(data["x.y"]) }
        })
      })

      /* Test: should read literal boolean values */
      it("should read literal boolean values", () => {
        const data = { "x.y": JSON.stringify(chance.bool()) }
        expect(unflatten(data, options)).toEqual({
          x: { y: JSON.parse(data["x.y"]) }
        })
      })

      /* Test: should read serialized array values */
      it("should read serialized array values", () => {
        const data = { "x.y": JSON.stringify([{ c: {} }]) }
        expect(unflatten(data, options)).toEqual({
          x: { y: [{ c: {} }] }
        })
      })

      /* Test: should not throw on invalid JSON */
      it("should not throw on invalid JSON", () => {
        const data = { "x.y": chance.string() }
        expect(() => {
          unflatten(data, options)
        }).not.toThrowError()
      })
    })

    /* with multiple attributes */
    describe("with multiple attributes", () => {

      /* Test: should read array with string values */
      it("should read array with string values", () => {
        const data = { "x.y[]": [JSON.stringify(chance.string())] }
        expect(unflatten(data)).toEqual({
          x: { y: data["x.y[]"].map(item => JSON.parse(item)) }
        })
      })

      /* Test: should read array with numeric values */
      it("should read array with numeric values", () => {
        const data = { "x.y[]": [JSON.stringify(chance.integer())] }
        expect(unflatten(data)).toEqual({
          x: { y: data["x.y[]"].map(item => JSON.parse(item)) }
        })
      })

      /* Test: should read array with boolean values */
      it("should read array with boolean values", () => {
        const data = { "x.y[]": [JSON.stringify(chance.bool())] }
        expect(unflatten(data)).toEqual({
          x: { y: data["x.y[]"].map(item => JSON.parse(item)) }
        })
      })

      /* Test: should write array with object values */
      it("should read array with object values", () => {
        const data = { "x.y[]": [JSON.stringify({ c: chance.bool() })] }
        expect(unflatten(data)).toEqual({
          x: { y: data["x.y[]"].map(item => JSON.parse(item)) }
        })
      })
    })

    /* with single attributes */
    describe("with single attributes", () => {

      /* Test: should read array with string values */
      it("should read array with string values", () => {
        const data = { "x.y": JSON.stringify([chance.string()]) }
        expect(unflatten(data)).toEqual({
          x: { y: JSON.parse(data["x.y"]) }
        })
      })

      /* Test: should read array with numeric values */
      it("should read array with numeric values", () => {
        const data = { "x.y": JSON.stringify([chance.integer()]) }
        expect(unflatten(data)).toEqual({
          x: { y: JSON.parse(data["x.y"]) }
        })
      })

      /* Test: should read array with boolean values */
      it("should read array with boolean values", () => {
        const data = { "x.y": JSON.stringify([chance.bool()]) }
        expect(unflatten(data)).toEqual({
          x: { y: JSON.parse(data["x.y"]) }
        })
      })

      /* Test: should write array with object values */
      it("should read array with object values", () => {
        const data = { "x.y": JSON.stringify([{ c: chance.bool() }]) }
        expect(unflatten(data)).toEqual({
          x: { y: JSON.parse(data["x.y"]) }
        })
      })
    })
  })
})
