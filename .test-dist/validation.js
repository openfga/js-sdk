"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWellFormedUlidString = exports.isWellFormedUriString = exports.assertParamExists = void 0;
const errors_1 = require("./errors");
/**
 *
 * @throws { FgaRequiredParamError }
 * @export
 */
const assertParamExists = function (functionName, paramName, paramValue) {
    if (paramValue === null || paramValue === undefined) {
        throw new errors_1.FgaRequiredParamError(functionName, paramName, `Required parameter ${paramName} was null or undefined when calling ${functionName}.`);
    }
};
exports.assertParamExists = assertParamExists;
/**
 *
 * @export
 */
const isWellFormedUriString = (uri) => {
    try {
        const uriResult = new URL(uri);
        return ((uriResult.toString() === uri || uriResult.toString() === `${uri}/`) &&
            (uriResult.protocol === "https:" || uriResult.protocol === "http:"));
    }
    catch (err) {
        return false;
    }
};
exports.isWellFormedUriString = isWellFormedUriString;
const isWellFormedUlidString = (ulid) => {
    const regex = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
    return !!(typeof ulid === "string" && ulid.match(regex)?.length);
};
exports.isWellFormedUlidString = isWellFormedUlidString;
//# sourceMappingURL=validation.js.map