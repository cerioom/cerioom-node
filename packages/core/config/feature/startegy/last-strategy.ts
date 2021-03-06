import { RuntimeError } from '../../../error'
import { ConfigFeatureProviderDefInterface } from '../config-feature-provider-def.interface'
import { Strategy } from './strategy'


export class LastStrategy extends Strategy {
    public async getProviderConfig(opts?: any): Promise<ConfigFeatureProviderDefInterface> {
        if (!this.providers.length || !this.providers[this.providers.length - 1]) {
            throw new RuntimeError('Provider not found')
        }

        return this.providers[this.providers.length - 1]
    }
}
