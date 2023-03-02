import { FgaRequiredParamError } from "./errors";

/**
 *
 * @throws { FgaRequiredParamError }
 * @export
 */
export const assertParamExists = function (functionName: string, paramName: string, paramValue: unknown) {
  if (paramValue === null || paramValue === undefined) {
    throw new FgaRequiredParamError(functionName, paramName, `Required parameter ${paramName} was null or undefined when calling ${functionName}.`);
  }
};

/**
 *
 * @export
 */
export const isWellFormedUriString = (uri: string): boolean => {
  try {
    const uriResult = new URL(uri);
    return ((uriResult.toString() === uri || uriResult.toString() === `${uri}/`) &&
      (uriResult.protocol === "https:" || uriResult.protocol === "http:"));
  } catch (err) {
    return false;
  }
};
