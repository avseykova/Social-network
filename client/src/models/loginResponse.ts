import type { IApiResponse } from "./apiResponse";

export interface ILoginResponse extends IApiResponse {
  user_id?: string;
  email?: string;
  }