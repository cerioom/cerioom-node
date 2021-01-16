import { LoggerInterface } from '../logger'
import { ParsedVersionInterface } from '../parsed-version.interface'
import { ServiceInterface } from '../service'


export interface ApplicationInterface extends ServiceInterface {
    name: string
    version: ParsedVersionInterface
    onExit: (code: number, logger) => void
    onUncaughtException: (err: Error, logger: LoggerInterface) => void
    onUnhandledRejection: (reason, p, logger) => void
}
