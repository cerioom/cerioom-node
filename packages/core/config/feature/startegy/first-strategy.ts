import { RuntimeError } from '../../../error'
import { ConfigFeatureProviderDefInterface } from '../config-feature-provider-def.interface'
import { Strategy } from './strategy'


export class FirstStrategy extends Strategy {
    public getProviderConfig(opts?: any): ConfigFeatureProviderDefInterface {
        if (!this.providers.length || !this.providers[0]) {
            throw new RuntimeError('Provider not found')
        }

        return this.providers[0]
    }
}
