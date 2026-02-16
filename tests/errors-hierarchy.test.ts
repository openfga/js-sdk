import { AxiosError, AxiosHeaders } from "axios";
import {
  FgaApiAuthenticationError,
  FgaApiError,
  FgaApiValidationError,
  FgaApiNotFoundError,
  FgaApiRateLimitExceededError,
  FgaApiInternalError,
  FgaError,
} from "../errors";

function createMockAxiosError(status: number): AxiosError {
  const headers = new AxiosHeaders();
  const error = new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    { headers } as any,
    {},
    {
      status,
      statusText: "Unauthorized",
      headers: {},
      config: { headers } as any,
      data: {},
    }
  );
  return error;
}

describe("Error hierarchy", () => {
  it("FgaApiAuthenticationError should be an instance of FgaApiError", () => {
    const axiosErr = createMockAxiosError(401);
    const authError = new FgaApiAuthenticationError(axiosErr);

    // This is the critical check: authentication errors should be caught by
    // generic FgaApiError catch blocks
    expect(authError).toBeInstanceOf(FgaApiError);
  });

  it("FgaApiAuthenticationError should also be an instance of FgaError", () => {
    const axiosErr = createMockAxiosError(401);
    const authError = new FgaApiAuthenticationError(axiosErr);

    expect(authError).toBeInstanceOf(FgaError);
    expect(authError).toBeInstanceOf(Error);
  });

  it("all API error subclasses should be instances of FgaApiError", () => {
    const axiosErr = createMockAxiosError(400);

    expect(new FgaApiValidationError(axiosErr)).toBeInstanceOf(FgaApiError);
    expect(new FgaApiNotFoundError(axiosErr)).toBeInstanceOf(FgaApiError);
    expect(new FgaApiRateLimitExceededError(axiosErr)).toBeInstanceOf(FgaApiError);
    expect(new FgaApiInternalError(axiosErr)).toBeInstanceOf(FgaApiError);
    expect(new FgaApiAuthenticationError(axiosErr)).toBeInstanceOf(FgaApiError);
  });
});
