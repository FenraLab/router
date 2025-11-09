
import { resourceUsage } from "process"
import type {Request} from "./types"

export enum EFragmentConsumptionResult {
    NoMatch,
    Consumed,
    Optional,
}

export interface IFragmentConsumptionReturn {
    update: string,
    result: EFragmentConsumptionResult
}

export abstract class AFragment {
    abstract toString(request?: Request): string;
    abstract consume(uri: string, request?: Request): Promise<IFragmentConsumptionReturn>
}

export class Fragment extends AFragment {

    constructor(public path: string){super()}

    toString(request?: Request){ return this.path }

    async consume(uri: string, request?: Request): Promise<IFragmentConsumptionReturn> {
        if (uri.startsWith(this.path) ){
            return {
                update: uri.slice(this.path.length),
                result: EFragmentConsumptionResult.Consumed
            }
        } else {
            return {
                update: uri,
                result: EFragmentConsumptionResult.NoMatch
            }
        }
    }
}

export class Parameter extends AFragment {

    constructor(public parameter: string){super()}

    toString(request?: Request){ return ':' + this.parameter }

    async consume(uri: string, request?: Request): Promise<IFragmentConsumptionReturn> {

        const index = uri.indexOf('/')
        let parameterValue = uri.slice(0, index > 0 ? index : uri.length)

        if (request){
            console.log("Set parameter", this.parameter, parameterValue)
            request.params[this.parameter] = parameterValue;
        }

        // console.log(parameterValue)
        return {
            update: uri.slice(parameterValue.length),
            result: EFragmentConsumptionResult.Consumed
        }
    }
}

export class DirectoryLike extends AFragment {
    public children: AFragment[]

    constructor(children: AFragment[]){
        super()
        this.children = children
    }

    toString(request?: Request): string {
        return this.children.map(it=>it.toString(request)).join() + '/'
        // throw new Error("Method not implemented.")
    }

    async consume(uri: string, request?: Request): Promise<IFragmentConsumptionReturn> {
        let update = uri
        let result: EFragmentConsumptionResult | undefined

        for (const child of this.children){
            let child_return = await child.consume(update, request)
            update = child_return.update;
            result = child_return.result;

            if (result == EFragmentConsumptionResult.NoMatch) return {update, result};
        }

        if (!update.length){
            return {update, result: EFragmentConsumptionResult.Consumed}
        }

        if (update.startsWith('/')){
            return {
                update: update.slice(1),
                result: EFragmentConsumptionResult.Consumed
            }
        }
        
        return {
            update: uri,
            result: EFragmentConsumptionResult.NoMatch
        }
    }
}

export class Optional extends AFragment{

    constructor(public children: Fragment[], public optional: boolean){ super() }

    toString(request?: Request){ return this.children.map(it=>it.toString()).join() }

    consume(uri: string, request?: Request): Promise<IFragmentConsumptionReturn> {
        throw new Error("Method not implemented.")
    }

}


export type EndpointURI = Fragment[]

export function TokenizeString(path: string): EndpointURI {
    return [new Fragment(path)]
}

export function EndpointURIToString( uri: EndpointURI, request?: Request) {
    return uri.map(it=>it.toString(request)).join('')
}