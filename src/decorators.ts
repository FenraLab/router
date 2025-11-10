import { Middleware } from "@fenralab/core"

import { Request, Response } from "./types"
import { Endpoint } from "./routing"

export function declareHandler(method: string) {
    return function (target: any, context: ClassMethodDecoratorContext) {
        context.addInitializer(function RegisterDeclaredHandler(this: Endpoint) {
            this.handle(method, this[target.name].bind(this))
        })  
    }
}