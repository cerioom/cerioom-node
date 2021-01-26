import { RuntimeError } from '@cerioom/core'

export class UnsupportedCurrencyError extends RuntimeError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.unsupported-currency.text')
    }
}
