import { ContextInterface } from '../context'
import { LoggerInterface } from '../logger'


export interface ServiceInterface {
    context: ContextInterface
    setContext(context: ContextInterface): this
    log: LoggerInterface
    configure: (opts: Record<string, any>) => this
}
