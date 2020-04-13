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
import { castArray, toPairs } from "lodash/fp"

import { IsotopeDictionary } from "../format"

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

/**
 * Isotope client options
 */
export interface IsotopeClientOptions {
  consistent?: boolean                 /* Whether to use consistent reads */
}

/**
 * Isotope client item
 */
export interface IsotopeClientItem {
  id: string,                          /* Identifier */
  attrs: IsotopeDictionary             /* Attributes */
}

/**
 * Isotope client item list
 */
export interface IsotopeClientItemList {
  items: IsotopeClientItem[]           /* Item list */
  next?: string                        /* Pagination token */
}

/* ----------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------- */

/**
 * Default client options
 */
const defaultOptions: Required<IsotopeClientOptions> = {
  consistent: false
}

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Map a dictionary to a list of SimpleDB attributes
 *
 * @param dict - Dictionary
 *
 * @return SimpleDB attributes
 */
export function mapDictionaryToAttributes(
  dict: IsotopeDictionary
): SimpleDB.ReplaceableAttribute[] {
  return toPairs(dict)
    .reduce<SimpleDB.ReplaceableAttribute[]>((attrs, [key, value]) => [
      ...attrs,
      ...castArray(value).map(entry => ({
        Name: key,
        Value: entry,
        Replace: true
      }))
    ], [])
}

/**
 * Map a list of SimpleDB attributes to a dictionary
 *
 * @param attrs - SimpleDB attributes
 *
 * @return Dictionary
 */
export function mapAttributesToDictionary(
  attrs: SimpleDB.Attribute[]
): IsotopeDictionary {
  return attrs
    .reduce<IsotopeDictionary>((dict, { Name, Value }) => ({
      ...dict,
      ...(Name.match(/\[\]$/)
        ? { [Name]: [ ...(dict[Name] || []), Value ] }
        : { [Name]: Value }
      )
    }), {})
}

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

/**
 * Isotope SimpleDB client abstraction
 */
export class IsotopeClient {

  /**
   * Isotope client options
   */
  protected options: Required<IsotopeClientOptions>

  /**
   * SimpleDB instance
   */
  protected simpledb: SimpleDB

  /**
   * Initialize a SimpleDB client
   *
   * @param domain - SimpleDB domain name
   * @param options - Client options
   * @param simpleDBOptions - Options to pass directly to SimpleDB constructor
   */
  public constructor(
    protected domain: string,
    options?: IsotopeClientOptions,
    simpleDBOptions?: SimpleDB.ClientConfiguration
  ) {
    this.options  = { ...defaultOptions, ...options }
    this.simpledb = new SimpleDB({ ...simpleDBOptions, apiVersion: "2009-04-15" })
  }

  /**
   * Create the SimpleDB domain
   *
   * @return Promise resolving with no result
   */
  public async create(): Promise<void> {
    await this.simpledb.createDomain({
      DomainName: this.domain
    }).promise()
  }

  /**
   * Destroy the SimpleDB domain
   *
   * @return Promise resolving with no result
   */
  public async destroy(): Promise<void> {
    await this.simpledb.deleteDomain({
      DomainName: this.domain
    }).promise()
  }

  /**
   * Retrieve an item from SimpleDB
   *
   * @param id - Identifier
   * @param names - Attribute names
   *
   * @return Promise resolving with item or undefined
   */
  public async get(
    id: string, names?: string[]
  ): Promise<IsotopeClientItem | undefined> {
    const { Attributes } = await this.simpledb.getAttributes({
      DomainName: this.domain,
      ItemName: id,
      AttributeNames: names,
      ConsistentRead: this.options.consistent
    }).promise()

    /* Item not found */
    if (!Attributes)
      return undefined

    /* Map identifier and attributes */
    return {
      id,
      attrs: mapAttributesToDictionary(Attributes)
    }
  }

  /**
   * Persist an item in SimpleDB
   *
   * @param id - Identifier
   * @param attrs - Attributes
   *
   * @return Promise resolving with no result
   */
  public async put(
    id: string, attrs: IsotopeDictionary
  ): Promise<void> {
    await this.simpledb.putAttributes({
      DomainName: this.domain,
      ItemName: id,
      Attributes: mapDictionaryToAttributes(attrs)
    }).promise()
  }

  /**
   * Delete an item or specific attributes from SimpleDB
   *
   * @param id - Identifier
   * @param names - Attribute names
   *
   * @return Promise resolving with no result
   */
  public async delete(
    id: string, names?: string[]
  ): Promise<void> {
    await this.simpledb.deleteAttributes({
      DomainName: this.domain,
      ItemName: id,
      ...(names
        ? {
            Attributes: names.map<SimpleDB.DeletableAttribute>(name => ({
              Name: name
            }))
          }
        : {}
      )
    }).promise()
  }

  /**
   * Retrieve a set of items matching the given SQL query
   *
   * @param expr - SQL query expression
   * @param next - Pagination token
   *
   * @return Promise resolving with item list
   */
  public async select(
    expr: string, next?: string
  ): Promise<IsotopeClientItemList> {
    const { Items, NextToken } = await this.simpledb.select({
      SelectExpression: expr,
      NextToken: next,
      ConsistentRead: this.options.consistent
    }).promise()

    /* No items found */
    if (!Items)
      return { items: [] }

    /* Map identifiers and attributes for each item */
    return {
      items: Items.map<IsotopeClientItem>(({ Name: id, Attributes }) => ({
        id,
        attrs: mapAttributesToDictionary(Attributes)
      })),
      next: NextToken
    }
  }
}
