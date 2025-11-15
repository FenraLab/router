import { Middleware } from "@fenralab/core";
import { Request, Response } from "../types";

export interface BodyParsedRequest extends Request {
  body?: string | Promise<string>;
}

export const xml: Middleware.TFunction<[BodyParsedRequest, Response]> = async (
  request,
  response,
  next,
) => {
  request.body = new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    request.on("error", reject);
  });

  await next();
};
