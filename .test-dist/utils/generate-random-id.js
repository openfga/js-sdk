"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomId = generateRandomId;
exports.generateRandomIdWithNonUniqueFallback = generateRandomIdWithNonUniqueFallback;
const crypto_1 = require("crypto");
/**
 * Generates a random ID
 *
 * Note: May not return a valid value on older browsers - we're fine with this for now
 */
function generateRandomId() {
    if (typeof crypto_1.randomUUID === "function") {
        return (0, crypto_1.randomUUID)();
    }
    if (typeof crypto_1.randomBytes === "function") {
        // Fallback for older node versions
        return (0, crypto_1.randomBytes)(20).toString("hex");
    }
    // For older browsers
    return;
}
function generateRandomIdWithNonUniqueFallback() {
    return generateRandomId() || "00000000-0000-0000-0000-000000000000";
}
//# sourceMappingURL=generate-random-id.js.map