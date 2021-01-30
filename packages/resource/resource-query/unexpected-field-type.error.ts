import { RuntimeError } from '@cerioom/core'


export class UnexpectedFieldTypeError extends RuntimeError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.unexpected-field-type')
    }
}
