export function setNotEnumerableProperty<T>(entity: object, property: string, value: T) {
  Object.defineProperty(entity, property, {
    enumerable: false,
    writable: false,
    value: value
  });
}
