import { Container } from '@atriory/common/ioc'
import { createLogger } from '@atriory/common/logger'
import { AsyncLocalStorage } from 'async_hooks'
import { ContextManager } from '../context'
import { LoggerInterface } from './logger.interface'


const als = new AsyncLocalStorage<any>()


const HEADER_X_REQUEST_ID = 'x-request-id'


export class LoggerManager /* implements LogManagerInterface */ {
    public middleware(): (req, res, next) => void {
        return (req, res, next): void => {
            try {
                req.log = createLogger({
                    serializers: {
                        req: function customReqSerializer(req) {
                            return {
                                id: req.id,
                                method: req.method,
                                url: req.url,
                                headers: req.headers,
                                remoteAddress: req.connection.remoteAddress,
                                remotePort: req.connection.remotePort,
                            }
                        },
                    },
                }).child({
                    requestId: req.headers[HEADER_X_REQUEST_ID],
                })

                Container.get(ContextManager).getContext().set('logger', req.log) // todo backward compatibility

                Container.get(LoggerManager).setLog(req.log, next)
            } catch (e) {
                next(e)
            }
        }
    }

    public setLog<R>(log: LoggerInterface, callback: (...args: any[]) => R, ...args: any[]): R {
        return als.run(log, callback, ...args)
    }

    public getLog(): LoggerInterface {
        const store = als.getStore()
        if (!store) {
            throw new Error()
        }

        return store
    }
}
