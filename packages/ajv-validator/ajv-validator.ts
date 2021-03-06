import { LoggerInterface, RuntimeError, ValidateFunction, Validator } from '@cerioom/core'
import ajv from 'ajv'
import localize from 'ajv-i18n'
import fs from 'fs'
import { cloneDeep } from 'lodash'
import path from 'path'


export class AjvValidator extends Validator {
    private ajv: ajv.Ajv
    private readonly ajvCustomizer: (ajv: ajv.Ajv) => ajv.Ajv
    private schemas: any[]
    private readonly defaults: ajv.Options | any = {}
    private opts: ajv.Options | any = {}


    constructor(opts?: ajv.Options, dir?: string, ajvCustomizer?: (ajv: ajv.Ajv) => ajv.Ajv) {
        super()

        dir = dir ?? path.resolve(__dirname, '/../../resources/schemas/')

        this.schemas = this.readDir(fs.realpathSync(dir))
            .filter(file => /^.*\.json$/.test(file))
            .map(file => require(file))

        if (opts) {
            this.opts = opts
        }

        this.defaults = {
            verbose: false,
            allErrors: false,
            coerceTypes: true,
            useDefaults: 'shared',
            removeAdditional: true,
            schemaId: 'auto',
        }

        if (ajvCustomizer) {
            this.ajvCustomizer = ajvCustomizer
        }

        this.updateAjvInstance()
    }

    public getSchemaById(id: string) {
        return this.schemas.find((value) => value.id === id)
    }

    public setLogger(logger: LoggerInterface) {
        this.options({
            ...this.opts,
            ...{
                log: logger.info.bind(logger),
                warn: logger.warn.bind(logger),
                error: logger.error.bind(logger),
            },
        })

        return super.setLogger(logger)
    }

    public getLogger() {
        return this.log
    }

    // public setI18n(i18n: I18nService): this {
    //     this.i18n = i18n
    //
    //     return this
    // }

    public addSchema(schemas: object | object[]): this {
        if (!Array.isArray(schemas)) {
            schemas = [schemas]
        }

        (<Array<Record<string, any>>> schemas).map(schema => this.schemas.push(schema))

        return this.updateAjvInstance()
    }

    public removeSchemaById(id: string): this {
        if (typeof id !== 'string') {
            throw new Error('Parameter $id must be string')
        }

        this.schemas = this.schemas.filter(
            (schema) => schema.$id !== id,
        )

        return this.updateAjvInstance()
    }

    public options(opts: ajv.Options): this {
        this.opts = opts
        this.updateAjvInstance()

        return this
    }

    public compile(how: any): ValidateFunction<unknown> {
        throw new Error('Method not implemented.')
    }

    public validate(keyRef: any, data: any): any {
        const clonedData = cloneDeep(data)
        const validate = this.ajv.getSchema(keyRef)
        if (typeof validate !== 'function') {
            const error = new RuntimeError(`The schema's keyRef "${keyRef}" was not recognized`)
            this.log.warn({module: 'validator.service', action: 'validate', error: error}, error.message)
            throw error
        }

        if (!validate(clonedData)) {
            if (this.lang?.language !== 'en' && this.lang.language in localize) {
                localize[this.lang.language](validate.errors)
            }
            this.log.debug({module: 'validator.service', action: 'validate', keyRef: keyRef, error: validate.errors})
            throw new RuntimeError().setValidation(<any> validate.errors)
        }

        return clonedData
    }

    private updateAjvInstance(): this {
        this.ajv = new ajv(Object.assign({}, this.defaults, this.opts))

        if (this.ajvCustomizer) {
            this.ajv = this.ajvCustomizer(this.ajv)
        }

        this.ajv.addSchema(this.schemas)

        return this
    }


    private readDir(dir) {
        return fs.statSync(dir).isDirectory()
            ? Array.prototype.concat(...fs.readdirSync(dir).map(f => this.readDir(path.join(dir, f))))
            : dir
    }
}
