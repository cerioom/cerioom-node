import { NotImplementedError } from '../../http'
import { ValidatorInterface } from './validator.interface'


export abstract class ValidatorService implements ValidatorInterface {
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
