import { AsyncLocalStorage } from 'async_hooks'
import * as _ from 'lodash'
import { SerializerInterface } from '../serializer'
import { Context } from './context'
import { ContextManagerInterface } from './context-manager.interface'
import { ContextInterface } from './context.interface'


export enum ContextScope {
    APP = 'APP',
    REQUEST = 'REQUEST',
    LOCAL = 'LOCAL',
}

export type SerializerRepository = Map<string, Pick<SerializerInterface<any>, 'serialize'>>
export type DeserializerRepository = Map<string, Pick<SerializerInterface<any>, 'deserialize'>>

export class ContextManager implements ContextManagerInterface {

    private serializersRepository: SerializerRepository = new Map()
    private deserializersRepository: DeserializerRepository = new Map()

    public constructor(
        public readonly strictScope = false
    ) {
    }

    /**
     * Middleware to setup context for request
     *
     * ```ts
     * const app = express()
     * const contextManager = DI.get(ContextManager)
     * app.use(contextManager.connectMiddleware())
     * ````
     */
    public connectMiddleware(): (req, res, next) => void {
        return function contextRequest(req, res, next) {
            try {
                // @ts-ignore
                this.setContext(ContextScope.REQUEST, next)
            } catch (e) {
                next(e)
            }
        }.bind(this)
    }

    /**
     * Set context
     *
     * @param scope
     * @param callback
     * @param args
     */
    public setContext<R>(scope: ContextScope, callback: (...args: any[]) => R, ...args: any[]): R {
        // @ts-ignore
        const als = global.__cerioom.scopes.get(scope)
        if (!als) {
            throw new Error(`Scope "${scope}" was not initiated`)
        }

        const context = new Context({scope: scope})
        return als.run(context, callback, ...args)
    }

    /**
     * Get context
     *
     * @param scope
     */
    public getContext(scope: ContextScope = ContextScope.REQUEST): ContextInterface {
        // @ts-ignore
        const context = global.__cerioom?.scopes?.get(scope)?.getStore()
        if (context) {
            return context
        }

        if (this.strictScope) {
            throw new Error(`Scope "${scope}" was not initiated`)
        }

        return new Context({scope: ContextScope.LOCAL})
    }

    /*
    private getEntries(o, prefix = '') {
        return Object.entries(o).flatMap(([k, v]) =>
            Object(v) === v  ? this.getEntries(v, `${prefix}${k}.`) : [ [`${prefix}${k}`, v] ]
        )
    }
    return Object.fromEntries(this.getEntries(obj))
    */

    public addSerializer(key: string, serializer: Pick<SerializerInterface<any>, 'serialize'>): SerializerRepository {
        return this.serializersRepository.set(key, serializer)
    }

    public removeSerializer(key: string): boolean {
        return this.serializersRepository.delete(key)
    }

    public getSerializer(key: string): Pick<SerializerInterface<any>, 'serialize'> | undefined {
        return this.serializersRepository.get(key)
    }

    public addDeserializer(key: string, serializer: Pick<SerializerInterface<any>, 'deserialize'>): DeserializerRepository {
        return this.deserializersRepository.set(key, serializer)
    }

    public removeDeserializer(key: string): boolean {
        return this.deserializersRepository.delete(key)
    }

    public getDeserializer(key: string): Pick<SerializerInterface<any>, 'deserialize'> | undefined {
        return this.deserializersRepository.get(key)
    }

    /**
     * Make headers from context
     */
    public makeHeaders(context: ContextInterface): Record<string, string> {
        return Object.keys(context).reduce((prev, key) => {
            const value = context[key] // todo js serialize
            const serializer = this.serializersRepository.get(key)
            if (serializer) {
                prev = {...prev, ...serializer.serialize(value)}
            } else if (typeof value === 'object') {
                prev[_.kebabCase(key)] = JSON.stringify(value)
            } else {
                prev[_.kebabCase(key)] = value
            }

            return prev
        }, {})
    }

    /**
     * Make context from headers
     */
    public makeContext(headers: Record<string, string>): ContextInterface {
        const data = Object.keys(headers).reduce((prev, key) => {
            const value = headers[key]
            const serializer = this.deserializersRepository.get(key)
            if (serializer) {
                prev = {...prev, ...serializer.deserialize(value)}
            } else if (typeof value === 'object') {
                try {
                    prev[_.camelCase(key)] = JSON.parse(value)
                } catch (e) {
                    prev[_.camelCase(key)] = value
                }
            } else {
                prev[_.camelCase(key)] = value
            }

            return prev
        }, {})

        return new Context(data)
    }
}

// @ts-ignore
global.__cerioom = Object.assign({}, global.__cerioom, {
    scopes: new Map<string, AsyncLocalStorage<ContextInterface>>()
        .set(ContextScope.APP, new AsyncLocalStorage<ContextInterface>())
        .set(ContextScope.REQUEST, new AsyncLocalStorage<ContextInterface>()),
})
