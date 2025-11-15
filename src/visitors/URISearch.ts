import { EParseOutcome, IInterpreterCursor, Interpret } from "@fenralab/url";

import type { Request, Response } from "../types";

import { EVisitResult, RouterVisitor } from "../routing";
import type { Endpoint } from "../routing";

export class URISearchVisitor<
  TRequest extends Request = Request,
  TResponse extends Response = Response,
  TEndpoint extends Endpoint<TRequest, TResponse, any> = Endpoint<
    TRequest,
    TResponse,
    any
  >,
> extends RouterVisitor<TRequest, TResponse, TEndpoint> {
  allowOptionalTerminalDirectory: boolean = true;

  result?: TEndpoint;

  cursor: IInterpreterCursor = {
    index: 0,
    params: {},
  };

  constructor(
    protected uri: string,
    protected request?: Request,
  ) {
    super();
  }

  protected override async visit(endpoint: TEndpoint): Promise<EVisitResult> {
    const result = Interpret(this.uri, endpoint.path, this.cursor);

    if (result.outcome != EParseOutcome.NoMatch) {
      if (
        result.outcome == EParseOutcome.Complete ||
        (this.allowOptionalTerminalDirectory &&
          this.uri.slice(result.cursor.index) == "/")
      ) {
        this.result = endpoint;
        return EVisitResult.Halt;
      }

      return EVisitResult.Recurse;
    }

    return EVisitResult.Continue;
  }
}
