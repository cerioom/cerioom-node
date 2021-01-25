import {RuntimeError} from '../core/error'


export class PhoneNumberInvalidError extends RuntimeError {
    constructor(message?: string) {
        super(message ?? 'i18n|phone:phone-number-invalid.text')
    }
}
