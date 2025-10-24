import { randomUUID, randomBytes } from "crypto";

/**
 * Generates a random ID
 *
 * Note: May not return a valid value on older browsers - we're fine with this for now
 */
export function generateRandomId(): string | undefined {
  if (typeof randomUUID === "function") {
    return randomUUID();
  }

  if (typeof randomBytes === "function") {
    // Fallback for older node versions
    return randomBytes(20).toString("hex");
  }

  // For older browsers
  return;
}

export function generateRandomIdWithNonUniqueFallback(): string {
  return generateRandomId() || "00000000-0000-0000-0000-000000000000";
}
