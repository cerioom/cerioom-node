import { RuntimeError } from './runtime.error'


export class NotImplementedError extends RuntimeError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.not-implemented.text')
    }
}
