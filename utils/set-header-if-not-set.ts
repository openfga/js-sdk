export function setHeaderIfNotSet(headers: Record<string, string>, key: string, value: string): void {
  if (!headers[key] && value) {
    headers[key] = value;
  }
}
