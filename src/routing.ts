import { Middleware } from '@fenralab/core'

import { Request, Response, VirtualURI } from "./types";
import { toAST, toTokens } from "./url";

/**
 * 
 */
export class Endpoint<
    TRequest extends Request = Request,
    TResponse extends Response = Response,
    TError = any,
> {
    
    public parent?: Router<Request, Response>;
    public handlers: Map<string, Middleware.TFunction<[TRequest, TResponse], TError>[]> = new Map();
    public middleware = new Middleware.Manager<[TRequest, TResponse]>();

    public path: VirtualURI;
    public fullURI: VirtualURI = []

    constructor(path: VirtualURI | string = []) {
        if (typeof path == "string") path = toAST(toTokens(path));
        this.path = path
        this.fullURI = this.path
    }

    acceptParent(parent: Router<TRequest, TResponse>){
        this.parent = parent
        this.fullURI = [...this.parent.fullURI, ...this.path]
    }

    use(
        ...middleware: Parameters<Middleware.Manager<[TRequest, TResponse]>['use']>
    ) {
        this.middleware.use(...middleware);
        return this;
    }

    handle(
        method: string,
        ...handler: Middleware.TFunction<[TRequest, TResponse], TError>[]
    ) {
        this.handlers.set(method.toLowerCase(), handler);
        return this;
    }

    async getHandler(method: string){
        return this.handlers.get(method.toLowerCase());
    }

}

export class Router<
    TRequest extends Request = Request,
    TResponse extends Response = Response,
    TError = any,
> extends Endpoint<TRequest, TResponse, TError> {

    public children: Endpoint<TRequest, TResponse, TError>[] = [];

    route<
        TFurther extends Endpoint<TRequest, TResponse, TError>
    >(
        ctor: new (...args: any[]) => TFurther,
        ...args: ConstructorParameters<typeof ctor>
    ): TFurther {
        
        const child = new ctor(...args);
        child.acceptParent(this)

        // Log.trace(`Registering child router for path '${child.fullURI}' on parent path '${this.fullURI}'`);

        this.children.push(child);
        return child;
    }

}

export enum EVisitResult {
    Continue,
    Halt,
    Recurse,
}

export abstract class RouterVisitor<
    TRequest extends Request = Request,
    TResponse extends Response = Response,
    TEndpoint extends Endpoint<TRequest, TResponse, any> = Endpoint<TRequest, TResponse, any>
> {
    stack: Array<TEndpoint> = []

    constructor(
        copyConstruct?: RouterVisitor<TRequest, TResponse, TEndpoint>
    ){
        if (copyConstruct){
            this.stack = copyConstruct.stack;
        }
    }

    public async traverse(endpoint: TEndpoint) : Promise<EVisitResult> {
        const result = await this.visit(endpoint)

        if (result === EVisitResult.Halt) return result;
        if (result !== EVisitResult.Recurse) return result;

        if (endpoint instanceof Router){
            this.stack.push(endpoint)
            for (const child of await this.getChildren(endpoint)) {
                const inner_result = await this.traverse(child);

                if (inner_result == EVisitResult.Halt) return inner_result;
            }
            this.stack.pop();
        }

        return result;
    }

    protected async getChildren(endpoint: Router): Promise<TEndpoint[]>{
        return endpoint.children as TEndpoint[]
    }

    protected abstract visit(endpoint: TEndpoint): Promise<EVisitResult>;
}