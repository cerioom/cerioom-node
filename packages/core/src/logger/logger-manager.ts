import { DI } from '../di'
import { AsyncLocalStorage } from 'async_hooks'
import { ContextManager } from '../context'
import { LoggerInterface, LoggerManagerInterface, Logger } from './'


const als = new AsyncLocalStorage<any>()


const HEADER_X_REQUEST_ID = 'x-request-id'


export class LoggerManager implements LoggerManagerInterface {
    public middleware(): (req, res, next) => void {
        return (req, res, next): void => {
            try {
                req.log = DI.get(Logger).child({requestId: req.headers[HEADER_X_REQUEST_ID]})
                DI.get(ContextManager).getContext().set('logger', req.log) // todo backward compatibility
                DI.get(LoggerManager).setLog(req.log, next)
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
