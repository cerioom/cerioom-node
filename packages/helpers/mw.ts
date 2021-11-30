import {EventEmitter} from 'events'

export type MiddlewareNext = (e?: any) => void

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppRequest {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppResponse {
}

type SuccessMiddleware = (request: AppRequest, response: AppResponse, next: MiddlewareNext) => void
type ErrorMiddleware = (err: Error, request: AppRequest, response: AppResponse, next: MiddlewareNext) => void

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

    public use (nextFn: Middleware): this {
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

        return this
    }

    public run (
        request: any,
        response: any,
        handler: (request: AppRequest, response: AppResponse) => void
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

// type Next = () => Promise<void> | void
// type Middleware<Req, Res> = (req: Req, res: Res, next: Next) => Promise<void> | void
// type Pipeline<Req, Res> = {
//     use: (...middlewares: Middleware<Req, Res>[]) => void
//     run: (req: Req, res: Res) => Promise<void>
// }
//
// export function Pipeline<Req, Res>(...middlewares: Middleware<Req, Res>[]): Pipeline<Req, Res> {
//     const stack: Middleware<Req, Res>[] = middlewares
//     const use: Pipeline<Req, Res>['use'] = (...middlewares) => {
//         stack.push(...middlewares)
//     }
//     const run: Pipeline<Req, Res>['run'] = async (req: Req, res: Res) => {
//         let prevIndex = -1
//         const runner = async (index: number): Promise<void> => {
//             if (index === prevIndex) {
//                 throw new Error('next() called multiple times')
//             }
//             prevIndex = index
//             const middleware = stack[index]
//             if (middleware) {
//                 await middleware(req, res, () => {
//                     return runner(index + 1)
//                 })
//             }
//         }
//         await runner(0)
//     }
//     return {use: use, run: run}
// }
