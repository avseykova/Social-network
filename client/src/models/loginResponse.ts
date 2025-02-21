import type { IApiResponse } from "./apiResponse";

export interface ILoginResponse extends IApiResponse {
  username?: string;
  }