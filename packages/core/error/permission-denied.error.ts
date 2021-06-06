import { RuntimeError } from './runtime.error'


export class PermissionDeniedError extends RuntimeError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.permission-denied.text')
    }
}
