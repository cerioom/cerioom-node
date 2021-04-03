import { UnauthorizedError } from '.'


export class TokenExpiredError extends UnauthorizedError {
    constructor(expiredAt: number, message?: string) {
        super(message ?? 'i18n|common:error.token-expired.text')
        this.setData({expiredAt: expiredAt})
    }
}

export class TokenNotBeforeError extends UnauthorizedError {
    constructor(date: Date, message?: string) {
        super(message ?? 'i18n|common:error.token-not-before.text')
        this.setData({date: date.toISOString()})
    }
}

export class TokenValidationError extends UnauthorizedError {
    constructor(validationMessage: string, message?: string) {
        super(message ?? 'i18n|common:error.token-invalid.text')
        this.setValidation([{
            path: '',
            message: validationMessage,
        }])
    }
}
