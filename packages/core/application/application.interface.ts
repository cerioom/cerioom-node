import { ParsedVersionInterface } from '../helper'
import { ServiceInterface } from '../service'


export interface ApplicationInterface extends ServiceInterface {
    name: string
    version: ParsedVersionInterface
    onExit: (code: number, logger) => void
    onUncaughtException: (err: Error, msg: string) => void
    onUnhandledRejection: (reason, p) => void
}
