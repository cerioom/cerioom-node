import { CharSet, Str } from '../helper'
import { ErrorInterface } from './error.interface'
import { ValidationResultInterface } from './validation-result.interface'

// todo https://www.npmjs.com/package/common-errors

export class RuntimeError extends Error implements ErrorInterface {
    public readonly id: string
    public readonly name: string
    public readonly message: string
    protected validation: ValidationResultInterface[] | undefined
    protected data: Record<string, string | number>
    protected cause: ErrorInterface | undefined
    protected loggable = true

    constructor(message = 'Runtime error') {
        super(message)
        this.name = this.constructor.name

        Object.defineProperty(this, 'id', {
            value: 'E' + Str.random(5, CharSet.B36.toUpperCase()),
            configurable: true,
            writable: false,
        })
    }

    public static toJSON(error): Record<string, any> {
        return {
            id: error.id ?? undefined,
            name: error.name ?? undefined,
            message: error.message ?? undefined,
            data: error.data ?? undefined,
            validation: error.validation ?? undefined,
        }
    }

    public static toString(error: ErrorInterface): string {
        return JSON.stringify(error)
    }

    public static fromString(error: string) {
        return RuntimeError.deserialize(JSON.parse(error))
    }

    public static deserialize(error: any /* todo */, errorClass?: [any]) {
        let err
        if (errorClass) {
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            // const fnErr = Function('msg', `return new ${error.name}(msg)`)();
            // err = fnErr(error.message)
            err = new errorClass[0](error.message)
        } else if (error.name in global) {
            err = new global[error.name](error.message)
        } else {
            err = new RuntimeError(error.message).setCause(error)
        }
        Object.defineProperty(err, 'id', {value: error.id, configurable: true, writable: false})
        err.setData(error.data)
        err.setValidation(error.validation)
        return err
    }

    public static toLog(error): Record<string, any> {
        return {
            id: error.id ?? undefined,
            name: error.name ?? undefined,
            message: error.message ?? undefined,
            data: error.data ?? undefined,
            validation: error.validation ?? undefined,
            cause: error.cause ? RuntimeError.toLog(error.cause) : undefined,
            stack: error.stack ?? undefined,
        }
    }

    public getValidation(): ValidationResultInterface[] | undefined {
        return this.validation
    }

    public setValidation(validation: ValidationResultInterface[]): this {
        this.validation = validation
        return this
    }

    public setCause(cause: ErrorInterface): this {
        this.cause = cause
        if ('id' in this.cause) {
            Object.defineProperty(this, 'id', {value: cause.id, configurable: true, writable: false})
        }

        return this
    }

    public setData(data: Record<string, string | number>): this {
        this.data = data
        return this
    }

    public getData(): Record<string, string | number> {
        return this.data
    }

    public setLoggable(flag = true): this {
        this.loggable = flag
        return this
    }

    public getLoggable(): boolean {
        return this.loggable
    }

    public toJSON(): any {
        return RuntimeError.toJSON(this)
    }

    public toLog(): Record<string, any> {
        return RuntimeError.toLog(this)
    }

    public toString() {
        return JSON.stringify(this.toJSON())
    }
}
