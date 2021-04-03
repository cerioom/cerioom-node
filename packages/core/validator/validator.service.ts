import { ValidatorInterface } from '.'
import { LoggerInterface } from '..'
import { NotImplementedError } from '../error'
import { LoggableInterface } from '../logger/loggable.interface'


export abstract class ValidatorService implements ValidatorInterface, LoggableInterface {
    public getLang(): any {
        throw new NotImplementedError()
    }

    public setLang(lang: any): this {
        throw new NotImplementedError()
    }

    public validate(how: any, what: any): any {
        throw new NotImplementedError()
    }

    public setLogger(logger: LoggerInterface): this {
        throw new NotImplementedError()
    }

    public getLogger(): LoggerInterface {
        throw new NotImplementedError()
    }
}
