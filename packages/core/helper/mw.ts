import {EventEmitter} from 'events'

export type MiddlewareNext = (e?: any) => void

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Request {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Response {
}

type SuccessMiddleware = (request: Request, response: Response, next: MiddlewareNext) => void
type ErrorMiddleware = (err: Error, request: Request, response: Response, next: MiddlewareNext) => void

export type Middleware = SuccessMiddleware | ErrorMiddleware

function isErrorMiddleware (middleware: Middleware): middleware is ErrorMiddleware {
    return middleware.length === 4
}

export class Mw extends EventEmitter {

    private properties: { [key: string]: any } = {}

    public set (key: string, value: any) {
        this.properties[key] = value
        return this
    }

    public get (key: string): any {
        return this.properties[key]
    }

    public use (nextFn: Middleware) {
        if (isErrorMiddleware(nextFn)) {
            const prevent = this.finalize.bind({})
            this.finalize = (e, request, response, next) => prevent(e, request, response, () => {
                (nextFn as ErrorMiddleware)(e, request, response, next)
            })
        } else {
            const prevent = this.executor.bind({})
            this.executor = (request, response, handlerCallback) => prevent(request, response, () => {
                // @ts-expect-error
                nextFn(request, response, (err) => {
                    if (err) {
                        this.finalize(err, request, response, () => {})
                    } else {
                        handlerCallback()
                    }
                })
            })
        }
    }

    public run (
        request: any,
        response: any,
        handler: (request: Request, response: Response) => void
    ) {
        this.executor(request, response, () => {
            handler(request, response)
        })
    }

    private executor: SuccessMiddleware = (request, response, next) => {
        next()
    }

    private finalize: ErrorMiddleware = (err, request, response, next) => {
        next(err)
    }
}
