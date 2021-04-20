import { RuntimeError } from '../../error'
import { FeatureProviderConfigInterface } from '../feature-provider-config.interface'
import { FeatureStrategy } from './feature-strategy'


export class LastFeatureStrategy extends FeatureStrategy {
    public getProviderConfig(opts?: any): FeatureProviderConfigInterface {
        if (!this.providers.length || !this.providers[this.providers.length - 1]) {
            throw new RuntimeError('Provider not found')
        }

        return this.providers[this.providers.length - 1]
    }
}
