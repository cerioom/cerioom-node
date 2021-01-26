import {RuntimeError} from '@cerioom/core'


export class PhoneNumberInvalidError extends RuntimeError {
    constructor(message?: string) {
        super(message ?? 'i18n|phone:phone-number-invalid.text')
    }
}
