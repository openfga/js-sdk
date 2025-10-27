export function assertNever(value: never): never {
  throw new Error(`Assertion failed. Unacceptable value: '${value}'`);
}
