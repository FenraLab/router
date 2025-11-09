import * as http from 'http'

import { Logger } from '@fenralab/core';
import { Syntax } from '@fenralab/url';

export const Log = new Logger.Logger('http');

export type VirtualURI = Syntax[]

export class Request extends http.IncomingMessage {
    params: Record<string, string> = {};
    log: Logger.Logger;
    body?: string | Promise<string>
}

export class Response extends http.ServerResponse {
    log: Logger.Logger;
}

