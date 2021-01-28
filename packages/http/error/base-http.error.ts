import { RuntimeError } from '@cerioom/core'


export class BaseHttpError extends RuntimeError {
    public readonly status: number

    constructor(message?: string, status = 500) {
        super(message ?? 'i18n|common:error.bad-request.text')
        this.status = status

        if (status < 500) {
            this.loggable = false
        }
    }

    public toJSON() {
        return {...super.toJSON(), status: this.status}
    }

    public toLog() {
        return {...super.toLog(), status: this.status}
    }

    public toString() {
        return JSON.stringify({...super.toJSON(), status: this.status})
    }
}
