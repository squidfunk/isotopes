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

import { SimpleDB } from "aws-sdk"
import { omit, set } from "lodash/fp"

import {
  IsotopeClient,
  IsotopeClientOptions
} from "./client"
import {
  flatten,
  IsotopeFormatOptions,
  unflatten
} from "./format"
import { IsotopeSelect } from "./select"
import { DeepPartial } from "./utilities"

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

/**
 * Isotope options
 *
 * @template T - Data type
 */
export interface IsotopeOptions<T extends {}> {
  format?: IsotopeFormatOptions        /* Format options */
  client?: IsotopeClientOptions        /* Client options */
  domain: string                       /* SimpleDB domain name */
  key: keyof T                         /* SimpleDB item name (primary key) */
  type?: string                        /* A type name that won't get minified */
}

/**
 * Isotope result
 *
 * @template T - Data type
 */
export interface IsotopeResult<T extends {}> {
  items: T[]                           /* Items on current page */
  next?: string                        /* Pagination token */
}

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

/**
 * Isotope
 *
 * By default this library forces only valid entries to be written to SimpleDB
 * which means that all non-optional fields need to be defined in the payload.
 * However, SimpleDB allows reading and writing of partial attribute values,
 * so it might be desirable in some cases to loosen that restriction and allow
 * partial reads and writes. Isotope allows both configurations through simple
 * generic typing.
 *
 * The first type argument is mandatory and defines the base type. The second
 * and third type arguments can be used to specify what exact types PUT and GET
 * operations return but normally they are equal to the base type.
 *
 * @example <caption>Allow complete values only</caption>
 *
 *   new Isotope<Type>
 *
 * @example <caption>Allow partial values in PUT and GET operations</caption>
 *
 *   new Isotope<Type, DeepPartial<Type>>
 *
 * @example <caption>Allow partial values in GET operations only</caption>
 *
 *   new Isotope<Type, Type, DeepPartial<Type>>
 *
 * @template T - Data type
 * @template TGet - Data type expected by PUT operation
 * @template TPut - Data type returned by GET operation
 */
export class Isotope<
  T    extends {},
  TPut extends DeepPartial<T> = T,
  TGet extends DeepPartial<T> = TPut,
> {

  /**
   * SimpleDB client
   */
  protected client: IsotopeClient

  /**
   * Initialize an isotope
   *
   * @param options - Options
   * @param simpleDBOptions -- Any configuration to be passed directly to SimpleDB
   */
  public constructor(protected options: IsotopeOptions<T>, simpleDBOptions?: SimpleDB.ClientConfiguration) {
    this.client = new IsotopeClient(options.domain, undefined, simpleDBOptions)
  }

  /**
   * Create an SQL query builder
   *
   * @return SQL query builder
   */
  public getQueryBuilder(): IsotopeSelect<T> {
    return new IsotopeSelect(this.options)
  }

  /**
   * Create the isotope
   *
   * @return Promise resolving with no result
   */
  public async create(): Promise<void> {
    await this.client.create()
  }

  /**
   * Destroy the isotope
   *
   * @return Promise resolving with no result
   */
  public async destroy(): Promise<void> {
    await this.client.destroy()
  }

  /**
   * Retrieve an item
   *
   * @param id - Identifier
   * @param names - Attribute names
   *
   * @return Promise resolving with (partial) item
   */
  public async get(
    id: string
  ): Promise<TGet | undefined>
  public async get(
    id: string, names: string[]
  ): Promise<DeepPartial<TGet> | undefined>
  public async get(
    id: string, names?: string[]
  ): Promise<TGet | DeepPartial<TGet> | undefined> {
    const item = await this.client.get(id, names)
    if (item) {
      delete item.attrs['__isotopes_type']
      return set(
        this.options.key,
        item.id,
        unflatten<TGet>(item.attrs, this.options.format)
      )
    }
    return undefined
  }

  /**
   * Persist an item
   *
   * @param data - Data to be persisted
   *
   * @return Promise resolving with no result
   */
  public async put(data: TPut): Promise<void> {
    if (typeof data[this.options.key] === "undefined")
      throw new Error(`Invalid identifier: "${this.options.key}" not found`)

    const amalgam = Object.assign({}, { '__isotopes_type': this.options.type }, data)
    await this.client.put(
      // tslint:disable-next-line
      amalgam[this.options.key]!.toString(),
      flatten(
        omit(this.options.key, amalgam),
        this.options.format
      )
    )
  }

  /**
   * Delete an item
   *
   * @param id - Identifier
   * @param names - Attribute names
   *
   * @return Promise resolving with no result
   */
  public async delete(id: string, names?: string[]): Promise<void> {
    await this.client.delete(id, names)
  }

  /**
   * Retrieve a set of items matching a given SQL query expression
   *
   * @template TSelect - Data type returned by SELECT operation
   *
   * @param expr - Query builder or string containing a SQL query expression
   * @param prev - Pagination token from previous result
   *
   * @return Promise resolving with result
   */
  public async select<TSelect extends TGet = TGet>(
    expr: IsotopeSelect<T> | string, prev?: string
  ): Promise<IsotopeResult<TSelect>> {
    const { items, next } = await this.client.select(expr.toString(), prev)
    return {
      items: items.map(item => {
        delete item.attrs['__isotopes_type']
        return set(
        this.options.key,
        item.id,
        unflatten<TSelect>(item.attrs, this.options.format)
      )}),
      next
    }
  }
}
