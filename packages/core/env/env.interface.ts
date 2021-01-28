import { ConfigInterface } from '../config'


export interface EnvInterface {
    name: string
    config: ConfigInterface
    isDevMode: boolean
    setDevMode: (value: boolean) => this
    checkRequiredVars: (envVars: string[]) => string[]
    nodeVersion: number
    var: (name: string) => string | number | boolean | null
}
