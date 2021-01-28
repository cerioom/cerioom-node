import { LoggerInterface } from './logger.interface'


export interface LoggerManagerInterface {
    middleware: () => (req, res, next) => void
    setLog: <R>(log: LoggerInterface, callback: (...args: any[]) => R, ...args: any[]) => R
    getLog: () => LoggerInterface
}
