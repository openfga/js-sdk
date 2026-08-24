"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setHeaderIfNotSet = setHeaderIfNotSet;
function setHeaderIfNotSet(headers, key, value) {
    if (!headers[key] && value) {
        headers[key] = value;
    }
}
//# sourceMappingURL=set-header-if-not-set.js.map