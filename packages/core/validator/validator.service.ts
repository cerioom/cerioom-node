import { ValidatorInterface } from '.'
import { Service } from '..'
import { NotImplementedError } from '../error'


export abstract class ValidatorService extends Service implements ValidatorInterface {
    public getLang(): any {
        throw new NotImplementedError()
    }

    public setLang(lang: any): this {
        throw new NotImplementedError()
    }

    public validate(how: any, what: any): any {
        throw new NotImplementedError()
    }
}
