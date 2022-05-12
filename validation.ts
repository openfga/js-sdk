import { OpenFgaRequiredParamError } from "./errors";

/**
 *
 * @throws { OpenFgaRequiredParamError }
 * @export
 */
export const assertParamExists = function (functionName: string, paramName: string, paramValue: unknown) {
  if (paramValue === null || paramValue === undefined) {
    throw new OpenFgaRequiredParamError(functionName, paramName, `Required parameter ${paramName} was null or undefined when calling ${functionName}.`);
  }
};
