import { Middleware } from "@fenralab/core";

import { Request, Response } from "./types";
import { Endpoint } from "./routing";

export function declareHandler(method: string) {
  return function (target: any, context: ClassMethodDecoratorContext) {
    context.addInitializer(function RegisterDeclaredHandler(this: unknown) {
      console.log(context.access.get(this));

      // const prop = this[context.name as keyof this];

      // // Make sure it is a function before binding
      // if (typeof prop === "function") {
      //     const handler = prop.bind(endpoint) as (req: Request, res: Response) => any;
      //     endpoint.handle(method, handler);
      // }
    });
  };
}
