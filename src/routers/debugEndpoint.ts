import { TMiddlewareNext } from "../../core/middleware";

import { declareHandler } from "../decorators";
import { Endpoint } from "../routing";
import { Request, Response } from "../types";

export class DebugEndpoint extends Endpoint {

    @declareHandler('get')
    async getMethod(request: Request, response: Response, next: TMiddlewareNext) {
        await next()
        response.write("Debugger Router")
    }
    
}