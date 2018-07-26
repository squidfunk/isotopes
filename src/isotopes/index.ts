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

import { omit } from "lodash"

import {
  IsotopeClient,
  IsotopeClientOptions
} from "isotopes/client"
import {
  decode,
  encode,
  IsotopeFormatOptions
} from "isotopes/format"

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

/**
 * Isotope options
 *
 * @template T - Data type
 */
export interface IsotopeOptions<T extends {}> {
  domain: string                       /* SimpleDB domain name */
  key: keyof T                         /* SimpleDB item name (primary key) */
  format?: IsotopeFormatOptions        /* Format options */
  client?: IsotopeClientOptions        /* Client options */
}

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

/**
 * Isotope
 *
 * @template T - Data type
 */
export class Isotope<T extends {}> {

  /**
   * SimpleDB client
   */
  protected client: IsotopeClient

  /**
   * Create an isotope
   *
   * @param options - Options
   */
  public constructor(protected options: IsotopeOptions<T>) {
    this.client = new IsotopeClient(options.domain)
  }

  /**
   * Retrieve an item by identifier
   *
   * @param id - Identifier
   * @param names - Attribute names
   *
   * @return Promise resolving with (partial) item data
   */
  public async get(id: string): Promise<T | undefined>
  public async get(id: string, names: string[]): Promise<Partial<T> | undefined>
  public async get(
    id: string, names?: string[]
  ): Promise<T | Partial<T> | undefined> {
    const item = await this.client.get(id, names)
    if (item) {
      const data: T = decode(item.attrs, this.options.format)
      data[this.options.key] = item.id as any // TODO: Fix types
      return data
    }
    return undefined
  }

  /**
   * Persist an item
   *
   * @param data - Data
   *
   * @return Promise resolving with no result
   */
  public async put(data: Partial<T>): Promise<void> {
    await this.client.put(
      data[this.options.key].toString(),
      encode(
        omit(data, this.options.key),
        this.options.format
      )
    )
  }

  /**
   * Delete an item
   *
   * @param item - Item identifier
   *
   * @return Promise resolving with no result
   */
  public async delete(id: string): Promise<void> {
    await this.client.delete(id)
  }
}
