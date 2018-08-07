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

import { SimpleDB } from "aws-sdk"
import { castArray, toPairs } from "lodash/fp"
import { OperationOptions } from "retry"

import { IsotopeDictionary } from "../format"
import { retryable } from "./retryable"

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

/**
 * Isotope client options
 */
export interface IsotopeClientOptions {
  consistent?: boolean                 /* Whether to use consistent reads */
  retry?: OperationOptions             /* Retry strategy options */
}

/**
 * Isotope client item
 */
export interface IsotopeClientItem {
  id: string,                          /* Item identifier */
  attrs: IsotopeDictionary             /* Item attributes */
}

/**
 * Isotope client item list
 */
export interface IsotopeClientItemList {
  items: IsotopeClientItem[]           /* Item list */
  next?: string                        /* Pagination token */
}

/* ----------------------------------------------------------------------------
 * Values
 * ------------------------------------------------------------------------- */

/**
 * Default client options
 *
 * We're not using the exponential backoff strategy (as recommended) due to the
 * observations made in this article: https://bit.ly/2AJQiNV
 */
const defaultOptions: Required<IsotopeClientOptions> = {
  consistent: false,
  retry: {
    minTimeout: 100,
    maxTimeout: 250,
    retries: 3,
    factor: 1
  }
}

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Map a dictionary to a list of SimpleDB attributes
 *
 * @param attrs - Attributes
 *
 * @return SimpleDB attributes
 */
export function mapDictionaryToAttributes(
  attrs: IsotopeDictionary
): SimpleDB.ReplaceableAttribute[] {
  return toPairs(attrs)
    .reduce<SimpleDB.ReplaceableAttribute[]>((list, [key, value]) => [
      ...list,
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
 * @param attrs - Attributes
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
   */
  public constructor(
    protected domain: string,
    options?: IsotopeClientOptions
  ) {
    this.options  = { ...defaultOptions, ...options }
    this.simpledb = new SimpleDB({ apiVersion: "2009-04-15" })
  }

  /**
   * Create the SimpleDB domain
   *
   * @return Promise resolving with no result
   */
  public async create(): Promise<void> {
    await retryable(() =>
      this.simpledb.createDomain({
        DomainName: this.domain
      }).promise(), this.options.retry)
  }

  /**
   * Destroy the SimpleDB domain
   *
   * @return Promise resolving with no result
   */
  public async destroy(): Promise<void> {
    await retryable(() =>
      this.simpledb.deleteDomain({
        DomainName: this.domain
      }).promise(), this.options.retry)
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
    const { Attributes } = await retryable(() =>
      this.simpledb.getAttributes({
        DomainName: this.domain,
        ItemName: id,
        AttributeNames: names,
        ConsistentRead: this.options.consistent
      }).promise(), this.options.retry)

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
    await retryable(() =>
      this.simpledb.putAttributes({
        DomainName: this.domain,
        ItemName: id,
        Attributes: mapDictionaryToAttributes(attrs)
      }).promise(), this.options.retry)
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
    await retryable(() =>
      this.simpledb.deleteAttributes({
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
      }).promise(), this.options.retry)
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
    const { Items, NextToken } = await retryable(() =>
      this.simpledb.select({
        SelectExpression: expr,
        NextToken: next,
        ConsistentRead: this.options.consistent
      }).promise(), this.options.retry)

    /* No items found */
    if (!Items)
      return {
        items: []
      }

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
