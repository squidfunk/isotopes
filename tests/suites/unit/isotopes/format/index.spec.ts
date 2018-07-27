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
  decode,
  encode,
  IsotopeFormatOptions
} from "isotopes/format"

import { chance } from "_/helpers"

/* ----------------------------------------------------------------------------
 * Tests
 * ------------------------------------------------------------------------- */

/* Isotope formatting utilities */
describe("isotopes/format", () => {

  /* encode */
  describe("encode", () => {

    /* with JSON format */
    describe("with JSON format", () => {

      /* Test: should flatten nested objects */
      it("should flatten nested objects", () => {
        const data = { a: { b: { c: chance.string() } } }
        expect(Object.keys(encode(data)))
          .toEqual(["a.b.c"])
      })

      /* Test: should write quoted string values */
      it("should write quoted string values", () => {
        const data = { a: { b: chance.string() } }
        expect(encode(data)).toEqual({
          "a.b": JSON.stringify(data.a.b)
        })
      })

      /* Test: should write literal numeric values */
      it("should write literal numeric values", () => {
        const data = { a: { b: chance.integer() } }
        expect(encode(data)).toEqual({
          "a.b": JSON.stringify(data.a.b)
        })
      })

      /* Test: should write literal boolean values */
      it("should write literal boolean values", () => {
        const data = { a: { b: chance.bool() } }
        expect(encode(data)).toEqual({
          "a.b": JSON.stringify(data.a.b)
        })
      })

      /* Test: should write serialized array values */
      it("should write serialized array values", () => {
        const data = { a: { b: [{ c: chance.string() }] } }
        expect(encode(data)).toEqual({
          "a.b": JSON.stringify(data.a.b)
        })
      })
    })

    /* with text format */
    describe("with text format", () => {

      /* Format options */
      const options: IsotopeFormatOptions = {
        encoding: "text"
      }

      /* Test: should flatten nested objects */
      it("should flatten nested objects", () => {
        const data = { a: { b: { c: chance.string() } } }
        expect(Object.keys(encode(data, options)))
          .toEqual(["a.b.c"])
      })

      /* Test: should write literal string values */
      it("should write literal string values", () => {
        const data = { a: { b: chance.string() } }
        expect(encode(data, options)).toEqual({
          "a.b": data.a.b
        })
      })

      /* Test: should write literal numeric values */
      it("should write literal numeric values", () => {
        const data = { a: { b: chance.integer() } }
        expect(encode(data, options)).toEqual({
          "a.b": JSON.stringify(data.a.b)
        })
      })

      /* Test: should write literal boolean values */
      it("should write literal boolean values", () => {
        const data = { a: { b: chance.bool() } }
        expect(encode(data, options)).toEqual({
          "a.b": JSON.stringify(data.a.b)
        })
      })

      /* Test: should write serialized array values */
      it("should write serialized array values", () => {
        const data = { a: { b: [{ c: chance.string() }] } }
        expect(encode(data, options)).toEqual({
          "a.b": JSON.stringify(data.a.b)
        })
      })
    })
  })

  /* decode */
  describe("decode", () => {

    /* with JSON format */
    describe("with JSON format", () => {

      /* Test: should expand nested objects */
      it("should expand nested objects", () => {
        const data = { "a.b.c": "{}" }
        expect(decode(data)).toEqual({
          a: { b: { c: {} } }
        })
      })

      /* Test: should read quoted string values */
      it("should read quoted string values", () => {
        const data = { "a.b": JSON.stringify(chance.string()) }
        expect(decode(data)).toEqual({
          a: { b: JSON.parse(data["a.b"]) }
        })
      })

      /* Test: should read literal numeric values */
      it("should read literal numeric values", () => {
        const data = { "a.b": JSON.stringify(chance.integer()) }
        expect(decode(data)).toEqual({
          a: { b: JSON.parse(data["a.b"]) }
        })
      })

      /* Test: should read literal boolean values */
      it("should read literal boolean values", () => {
        const data = { "a.b": JSON.stringify(chance.bool()) }
        expect(decode(data)).toEqual({
          a: { b: JSON.parse(data["a.b"]) }
        })
      })

      /* Test: should read serialized array values */
      it("should read serialized array values", () => {
        const data = { "a.b": JSON.stringify([{ c: {} }]) }
        expect(decode(data)).toEqual({
          a: { b: [{ c: {} }] }
        })
      })

      /* Test: should throw on invalid JSON */
      it("should throw on invalid JSON", () => {
        const data = { "a.b": chance.string() }
        expect(() => {
          decode(data)
        }).toThrowError()
      })
    })

    /* with text format */
    describe("with text format", () => {

      /* Format options */
      const options: IsotopeFormatOptions = {
        encoding: "text"
      }

      /* Test: should expand nested objects */
      it("should expand nested objects", () => {
        const data = { "a.b.c": "{}" }
        expect(decode(data, options)).toEqual({
          a: { b: { c: {} } }
        })
      })

      /* Test: should read literal string values */
      it("should read literal string values", () => {
        const data = { "a.b": chance.string() }
        expect(decode(data, options)).toEqual({
          a: { b: data["a.b"] }
        })
      })

      /* Test: should read literal numeric values */
      it("should read literal numeric values", () => {
        const data = { "a.b": JSON.stringify(chance.integer()) }
        expect(decode(data, options)).toEqual({
          a: { b: JSON.parse(data["a.b"]) }
        })
      })

      /* Test: should read literal boolean values */
      it("should read literal boolean values", () => {
        const data = { "a.b": JSON.stringify(chance.bool()) }
        expect(decode(data, options)).toEqual({
          a: { b: JSON.parse(data["a.b"]) }
        })
      })

      /* Test: should read serialized array values */
      it("should read serialized array values", () => {
        const data = { "a.b": JSON.stringify([{ c: {} }]) }
        expect(decode(data, options)).toEqual({
          a: { b: [{ c: {} }] }
        })
      })

      /* Test: should not throw on invalid JSON */
      it("should not throw on invalid JSON", () => {
        const data = { "a.b": chance.string() }
        expect(() => {
          decode(data, options)
        }).not.toThrowError()
      })
    })
  })
})
