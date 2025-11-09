import { Request, Response, } from "../types"
import { Endpoint,EVisitResult, RouterVisitor } from "../routing";
import { inspect } from "util";

export class ServerPrinter extends RouterVisitor {

    protected async visit(endpoint: Endpoint<Request, Response, any>): Promise<EVisitResult> {
        console.log(`${inspect(endpoint.fullURI)} (${Array.from(endpoint.handlers.keys()).join(", ")})`)
        return EVisitResult.Recurse;
    }

}