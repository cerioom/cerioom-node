import { ConfigInterface } from '../config'
import { EnvInterface } from './env.interface'


export class Env implements EnvInterface {
    protected readonly _name: string
    protected readonly _config: ConfigInterface
    protected _isDevMode: boolean
    protected _nodeVersion: number

    constructor(name: string, config: ConfigInterface, isDevMode?: boolean) {
        const prodEnvNames = ['prod', 'production']
        const nodeEnv = process.env.NODE_ENV ?? 'production'
        const configEnv = process.env.CONFIG_ENV ?? nodeEnv

        this._name = name
        this._config = config
        this._isDevMode = isDevMode ?? !(prodEnvNames.includes(nodeEnv) || prodEnvNames.includes(configEnv))
        this._nodeVersion = parseInt(process.version.slice(1).split('.')[0], 10)
    }

    public get name(): string {
        return this._name
    }

    public get isDevMode(): boolean {
        return this._isDevMode
    }

    public setDevMode(value: boolean): this {
        this._isDevMode = value
        return this
    }

    public get config(): ConfigInterface {
        return this._config
    }

    public get nodeVersion(): number {
        return this._nodeVersion
    }

    public checkRequiredVars(envVars: string[]): string[] {
        return envVars.filter(envVar => !(envVar in process.env))
    }

    public var(name: string): string | number | boolean | null {
        return process.env[name] ?? null
    }
}
