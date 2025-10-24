export function chunkArray<T>(inputArray: T[], maxChunkSize: number): T[][] {
  const arrayOfArrays = [];

  const inputArrayClone = [...inputArray];
  while (inputArrayClone.length > 0) {
    arrayOfArrays.push(inputArrayClone.splice(0, maxChunkSize));
  }

  return arrayOfArrays;
}
