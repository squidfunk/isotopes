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

import { IsotopeClient } from "isotopes/client"
import { decode, encode } from "isotopes/format"

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

/**
 * Isotope configuration
 *
 * @template T - Object type
 */
export interface IsotopeConfiguration<T> {
  domain: string                       /* SimpleDB domain name */
  key: keyof T                         /* SimpleDB item name (primary key) */
}

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

/**
 * Isotope
 *
 * @template T - Object type
 */
export class Isotope<T extends {}> {

  /**
   * SimpleDB client
   */
  protected client: IsotopeClient

  /**
   * Object key used as item name
   */
  protected key: keyof T

  /**
   * Create an isotope
   *
   * @param config - Configuration
   */
  public constructor(config: IsotopeConfiguration<T>) {
    this.client = new IsotopeClient(config.domain)
    this.key    = config.key
  }

  /**
   * Retrieve an item
   *
   * @param id - Item identifier
   *
   * @return Promise resolving with item
   */
  public async get(id: string): Promise<T | undefined> {
    const record = await this.client.get(id)
    if (record) {
      const item: any = decode(record.attrs) // TODO: fix types
      item[this.key] = record.id
      return item
    }
    return undefined
  }

  /**
   * Persist an item
   *
   * @param item - Item
   *
   * @return Promise resolving with no result
   */
  public async put(item: T): Promise<void> {
    const data = omit(item, this.key)
    await this.client.put(
      item[this.key].toString(),
      encode(data)
    )
  }

  /**
   * Delete an item
   *
   * @param item - Item identifier
   *
   * @return Promise resolving with item
   */
  public async delete(id: string): Promise<void> {
    await this.client.delete(id)
  }
}
