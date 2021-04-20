import { RuntimeError } from '../../error'
import { Random } from '../../helper'
import { FeatureProviderConfigInterface } from '../feature-provider-config.interface'
import { FeatureStrategy } from './feature-strategy'


export class RandomFeatureStrategy extends FeatureStrategy {
    public getProviderConfig(opts?: any): FeatureProviderConfigInterface {
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
