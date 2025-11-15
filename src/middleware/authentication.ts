import { Middleware } from "@fenralab/core";
import { Request, Response } from "../types";

export enum EAuthenticationStatus {
  Unauthenticated,
  Authenticated,
}

export interface AuthenticatedRequest extends Request {
  authenticated?: EAuthenticationStatus;
}

export interface IAuthenticationStrategy {
  authenticate(request: AuthenticatedRequest): Promise<EAuthenticationStatus>;
}

export class DebugAuthenticationStrategry implements IAuthenticationStrategy {
  async authenticate(
    request: AuthenticatedRequest,
  ): Promise<EAuthenticationStatus> {
    console.log("It's happening");
    request.authenticated = EAuthenticationStatus.Authenticated;
    return request.authenticated;
  }
}

/* eslint-disable  @typescript-eslint/no-empty-object-type */
export interface IAuthenticator {}

export interface IAuthenticationOptions {
  strategy: IAuthenticationStrategy;
}

export function Authentication(
  options: IAuthenticationOptions,
): Middleware.TFunction<[AuthenticatedRequest, Response]> {
  return async function AuthenticationMiddleware(request, response, next) {
    await options.strategy.authenticate(request);
    await next();
  };
}
