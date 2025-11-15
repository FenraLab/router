import * as http from "http";
import { inspect } from "util";

import { Middleware } from "@fenralab/core";

import { Log, Request, Response } from "./types";
import { Endpoint, Router } from "./routing";
import * as Exceptions from "./exceptions";

import { URISearchVisitor } from "./visitors/URISearch";

export class Server<
  TRequest extends Request = Request,
  TResponse extends Response = Response,
  TRootRouter extends Router<TRequest, TResponse, any> = Router<
    TRequest,
    TResponse,
    any
  >,
> {
  static Logger = Log.child("server");

  public router: TRootRouter;
  protected httpInstance: http.Server;

  constructor(
    rootRouterCtor: new (...args: any[]) => TRootRouter,
    ...args: ConstructorParameters<typeof rootRouterCtor>
  ) {
    this.router = new rootRouterCtor(...args);
    this.httpInstance = http.createServer(this.receive.bind(this));
  }

  public use(...args: Parameters<TRootRouter["use"]>) {
    return this.router.use(...args);
  }

  public route<
    TRouter extends Endpoint<TRequest, TResponse, any> = Endpoint<
      TRequest,
      TResponse,
      any
    >,
  >(
    ctor: new (...args: any[]) => TRouter,
    ...args: ConstructorParameters<typeof ctor>
  ): TRouter {
    return this.router.route(ctor, ...args);
  }

  public handle(
    method: string,
    ...handler: Middleware.TFunction<[TRequest, TResponse]>[]
  ) {
    return this.router.handle(method, ...handler);
  }

  public listen(port: number) {
    this.httpInstance.listen(port, () => {
      Server.Logger.info(`Server started. http://localhost:${port}/`);
    });
  }

  public close() {
    return this.httpInstance.close();
  }

  private async receive(
    nativeRequest: http.IncomingMessage,
    nativeResponse: http.ServerResponse,
  ) {
    // Server.Logger.info(`Received ${nativeRequest.method} ${nativeRequest.url}`);

    if (!nativeRequest.url) return;
    if (!nativeRequest.method) return;

    const request = nativeRequest as TRequest;
    request.params = {};
    request.log = Log.child(`request:${request.method}:${request.url}`);
    request.body = new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      request.on("data", (chunk) => chunks.push(chunk));
      request.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      request.on("error", reject);
    });

    const response = nativeResponse as TResponse;
    response.log = Log.child(`response:${request.method}:${request.url}`);

    try {
      // console.time('URI Matching Traversal')
      const traversalAgent = new URISearchVisitor<
        TRequest,
        TResponse,
        TRootRouter
      >(request.url!, request);
      await traversalAgent.traverse(this.router);
      if (!traversalAgent.result) throw new Exceptions.NotFound();
      // console.timeEnd('URI Matching Traversal')

      // console.time('Get Endpoint Method')
      request.params = traversalAgent.cursor.params;
      const handler = await traversalAgent.result.getHandler(request.method!);
      if (!handler) {
        throw new Exceptions.MethodNotAllowed();
      }
      // console.timeEnd('Get Endpoint Method')

      // console.time('Execute Middleware')
      const middlewares = [
        ...traversalAgent.stack.flatMap((it) => it.middleware.array),
        ...traversalAgent.result.middleware.array,
        ...handler,
      ];

      await Middleware.invoke(middlewares, request, response);

      // console.timeEnd('Execute Middleware')

      // request.log.trace(`Middlewares: ${inspect(middlewares)}`)
      // Server.Logger.success(`Successfully processed request ${request.method} ${request.url}`);
    } catch (error) {
      response.statusCode = 500;

      if (error instanceof Exceptions.RouterManagedError) {
        request.log.warn(`Managed error processing request: ${error.message}`);
        error.handle(request, response);
      } else if (error instanceof Error) {
        request.log.error(`Error processing request: ${error}`);
        request.log.trace(error.stack ?? "");
      } else {
        response.write("Internal Server Error\n");
      }
    }

    response.end();
  }
}
