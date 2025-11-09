import { Middleware } from "@fenralab/core"

import type { Request, Response } from "./types"
import { Endpoint } from "./routing"

export function declareHandler(method: string) {
    return function (target: Middleware.TMethod<Endpoint,[Request, Response]>, context: ClassMethodDecoratorContext<Endpoint>) {
        context.addInitializer(function RegisterDeclaredHandler(this: Endpoint) {
            this.handle(method, this[target.name].bind(this))
        })  
    }
}