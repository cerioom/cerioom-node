import { NotImplementedError as BaseNotImplementedError } from '@cerioom/core'
import { BaseHttpError } from './base-http.error'


export class BadRequestError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.bad-request.text', 400)
    }
}

export class UnauthorizedError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.unauthorized.text', 401)
    }
}

export class PaymentError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.payment.text', 402)
    }
}

export class ForbiddenError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.forbidden.text', 403)
    }
}

export class NotFoundError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.not-found.text', 404)
    }
}

export class RouteNotFoundError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.route-not-found.text', 404)
    }
}

export class MethodNotAllowedError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.method-not-allowed.text', 405)
    }
}

export class NotAcceptableError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.not-acceptable.text', 406)
    }
}

export class RequestTimeoutError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.request-timeout.text', 408)
    }
}

export class ConflictError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.conflict.text', 409)
    }
}

export class GoneError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.gone.text', 410)
    }
}

export class UnsupportedMediaTypeError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.unsupported-media-type.text', 415)
    }
}

export class UnprocessableEntityError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.validation-failed.text', 422)
    }
}

export class TooManyRequestsError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.too-many-requests.text', 429)
    }
}

export class InternalServerError extends BaseHttpError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.internal-server-error.text', 500)
    }
}

export class NotImplementedError extends BaseNotImplementedError {
    constructor(message?: string) {
        super(message ?? 'i18n|common:error.not-implemented.text', 501)
    }
}
