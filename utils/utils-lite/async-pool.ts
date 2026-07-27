/**
 * Async concurrency pool.
 *
 * Based on tiny-async-pool by Rafael Xavier de Souza, licensed under MIT.
 * https://github.com/rxaviers/async-pool
 *
 * Original license from https://github.com/rxaviers/async-pool/blob/master/LICENSE-MIT:
 *
 *   Copyright (c) 2017 Rafael Xavier de Souza http://rafael.xavier.blog.br
 *
 *   Permission is hereby granted, free of charge, to any person
 *   obtaining a copy of this software and associated documentation
 *   files (the "Software"), to deal in the Software without
 *   restriction, including without limitation the rights to use,
 *   copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following
 *   conditions:
 *
 *   The above copyright notice and this permission notice shall be
 *   included in all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 *   OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 *   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *   OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Runs async functions in a limited concurrency pool.
 * Yields results as they complete, in order of input.
 * Rejects immediately if any promise rejects.
 *
 * @param concurrency - Maximum number of concurrent executions (>= 1)
 * @param iterable - Input items to process
 * @param iteratorFn - Async function to apply to each item
 */
export async function* asyncPool<IN, OUT>(
  concurrency: number,
  iterable: Iterable<IN>,
  iteratorFn: (item: IN) => Promise<OUT>,
): AsyncGenerator<OUT> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const executing = new Set<Promise<any>>();

  async function consume(): Promise<OUT> {
    const [promise, value] = await Promise.race(executing);
    executing.delete(promise);
    return value;
  }

  for (const item of iterable) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let promise: Promise<any>;
    promise = (async () => iteratorFn(item))()
      .then((value): [Promise<unknown>, OUT] => [promise, value]);
    executing.add(promise);
    if (executing.size >= concurrency) {
      yield await consume();
    }
  }
  while (executing.size) {
    yield await consume();
  }
}
