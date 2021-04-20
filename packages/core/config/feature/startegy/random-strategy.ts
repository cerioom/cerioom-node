import { RuntimeError } from '../../../error'
import { Random } from '../../../helper'
import { ConfigFeatureProviderDefInterface } from '../config-feature-provider-def.interface'
import { Strategy } from './strategy'


export class RandomStrategy extends Strategy {
    public getProviderConfig(opts?: any): ConfigFeatureProviderDefInterface {
        if (!this.providers.length) {
            throw new RuntimeError('Provider not found')
        }

        const provider = Random.element(this.providers)
        if (!provider) {
            throw new RuntimeError('Provider not found')
        }

        return provider
    }
}
