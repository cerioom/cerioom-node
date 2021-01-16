import { ContextInterface } from '../context'
import { LoggerInterface } from '../logger'


export interface ServiceInterface {
    context: ContextInterface
    log: LoggerInterface
}
