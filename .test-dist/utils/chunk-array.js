"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkArray = chunkArray;
function chunkArray(inputArray, maxChunkSize) {
    const arrayOfArrays = [];
    const inputArrayClone = [...inputArray];
    while (inputArrayClone.length > 0) {
        arrayOfArrays.push(inputArrayClone.splice(0, maxChunkSize));
    }
    return arrayOfArrays;
}
//# sourceMappingURL=chunk-array.js.map