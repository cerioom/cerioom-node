import { BadRequestError } from '../../http/error'

export class UnexpectedFieldTypeError extends BadRequestError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.unexpected-field-type')
    }
}
