export interface ErrorObject<P = Record<string, any>> {
    params: P;
    message?: string;
    data?: unknown;
}

export type ValidateFunction<T = unknown> = (this: any, data: any, dataCxt?: any) => data is T

export interface ValidatorInterface {
    setLang(lang: any): this

    getLang(): any

    compile(how: any): ValidateFunction

    validate(how: any, what: any): any
}
