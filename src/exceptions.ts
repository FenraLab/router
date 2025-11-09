import type { Request, Response } from "./types";

export class RouterManagedError extends Error {
    constructor(public code: string | number = 500, message: string = "Server Error") {
        super(message);
        this.name = `Error ${code} ${message}`;
    }

    handle(req: Request, res: Response) { 
        res.writeHead(this.code as number, { 'Content-Type': 'text/plain' });
        res.write(`${this.code} ${this.message}\n`);
    }
}

function errorHelper(code: string | number, message: string) {
    return class RouterDynamicManagedError extends RouterManagedError {
        constructor() { super(code, message) }
    }
}

export class NotFound extends errorHelper(404, "Not Found") {};
export class MethodNotAllowed extends errorHelper(405, "Method Not Allowed") {}