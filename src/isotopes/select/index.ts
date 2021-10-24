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
  isArray,
  isObject,
  isUndefined
} from "lodash/fp"
import {
  Expression,
  select,
  Select
} from "squel"
import squel = require("squel")

import { IsotopeOptions } from ".."

const typeFilter = (type: string): Expression => squel.expr()
  .and('`__isotopes_type` = ?', JSON.stringify(type));

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

/**
 * Isotope SQL query builder
 *
 * Under the hood the squel query builder is used, but methods are proxied to
 * accommodate for the limited feature set supported by SimpleDB.
 *
 * @template T - Data type
 */
export class IsotopeSelect<T extends {}> {

  /**
   * Initialize a SQL query expression builder
   *
   * @param options - Options
   * @param query - Squel instance
   */
  public constructor(
    protected options: IsotopeOptions<T>,
    protected query: Select = select({
      autoQuoteTableNames: true,
      autoQuoteFieldNames: true
    }).from(options.domain).where(isUndefined(options.type) ? '' : typeFilter(options.type))
  ) {}

  /**
   * Add WHERE clause
   *
   * Monkey-patch where() method if strings are formatted as JSON
   *
   * @param condition - Condition expression
   * @param args - Additional arguments for parameter substitution
   *
   * @return Instance
   */
  public where(condition: string | Expression, ...args: any[]): this {
    if (typeof this.options.format === "undefined" ||
        this.options.format.encoding === "json") {
      this.query.where(condition, ...args
        .filter(arg => !isUndefined(arg))
        .map(arg => {
          return typeof condition === "string" && condition.match(/ LIKE /i)
            ? arg.replace(/(^(?!%)|([^%]|\\%)$)/g, (...$: any[]) => `${$[1]}\"`)
            : JSON.stringify(arg)
        }))
    } else {
      this.query.where(condition, ...args
        .filter(arg => !isUndefined(arg))
        .map(arg => {
          return isArray(arg) || isObject(arg)
            ? JSON.stringify(arg)
            : arg.toString()
        }))
    }
    return this
  }

  /**
   * Add ORDER BY clause
   *
   * @param field - Sort field
   * @param direction - Sort direction
   *
   * @return Instance
   */
  public order(field: string, direction?: "asc" | "desc"): this {
    this.query.order(field, !direction || direction === "asc")
    return this
  }

  /**
   * Add LIMIT clause
   *
   * @param count - Number of records
   *
   * @return Instance
   */
  public limit(count: number): this {
    this.query.limit(count)
    return this
  }

  /**
   * Create a string representation of the SQL query
   *
   * @return SQL query string
   */
  public toString() {
    return this.query.toString()
  }
}
