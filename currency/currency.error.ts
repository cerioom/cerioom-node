import { UnprocessableEntityError } from '../http/error'

export class UnsupportedCurrencyError extends UnprocessableEntityError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.unsupported-currency.text')
    }
}
