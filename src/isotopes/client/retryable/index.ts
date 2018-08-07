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

import { AWSError } from "aws-sdk"
import { operation, OperationOptions } from "retry"

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Make a function returning a Promise retryable
 *
 * Only 5xx errors need to be retried as we don't need to retry client errors,
 * so fail immediately if the status code is below 500.
 *
 * @param action - Function returning a Promise
 * @param options - Retry strategy options
 *
 * @return Promise resolving with the original Promise's result
 */
export function retryable<T>(
  action: () => Promise<T>,
  options: OperationOptions
): Promise<T> {
  return new Promise((resolve, reject) => {
    const op = operation(options)
    op.attempt(async () => {
      try {
        resolve(await action())
      } catch (err) {
        const { statusCode } = err as AWSError
        if (!statusCode || statusCode < 500 || !op.retry(err))
          reject(err)
      }
    })
  })
}
