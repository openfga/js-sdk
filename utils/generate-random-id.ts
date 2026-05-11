import { randomUUID, randomBytes } from "crypto";

/**
 * Generates a random ID
 *
 * Note: May not return a secure random value.
 *       We're fine with this, as this is just used to identify requests.
 */
export function generateRandomId(): string {
  if (typeof randomUUID === "function") {
    return randomUUID();
  }

  if (typeof randomBytes === "function") {
    // Fallback for older node versions
    return randomBytes(20).toString("hex");
  }

  // Fallback for older browsers and runtimes without crypto support
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRandomIdWithNonUniqueFallback(): string {
  return generateRandomId();
}
