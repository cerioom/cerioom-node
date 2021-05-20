import { ValidateFunction, ValidatorInterface } from '.'
import { LoggerInterface } from '..'
import { LoggableInterface } from '../logger'


export abstract class Validator implements ValidatorInterface, LoggableInterface {
    protected lang: any = {language: 'en', region: undefined}
    protected log: LoggerInterface

    public setLang(lang: any): this {
        this.lang = lang
        return this
    }

    public getLang(): any {
        return this.lang
    }

    public setLogger(logger: LoggerInterface): this {
        this.log = logger
        return this
    }

    public getLogger(): LoggerInterface {
        return this.log
    }

    public abstract validate(how: any, what: any): any

    public abstract compile(how: any): ValidateFunction
}
