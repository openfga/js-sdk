"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setNotEnumerableProperty = setNotEnumerableProperty;
function setNotEnumerableProperty(entity, property, value) {
    Object.defineProperty(entity, property, {
        enumerable: false,
        writable: false,
        value: value
    });
}
//# sourceMappingURL=set-not-enumerable-property.js.map