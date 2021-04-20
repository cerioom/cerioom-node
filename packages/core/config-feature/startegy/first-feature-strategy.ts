import { RuntimeError } from '../../error'
import { FeatureProviderConfigInterface } from '../feature-provider-config.interface'
import { FeatureStrategy } from './feature-strategy'


export class FirstFeatureStrategy extends FeatureStrategy {
    public getProviderConfig(opts?: any): FeatureProviderConfigInterface {
        if (!this.providers.length || !this.providers[0]) {
            throw new RuntimeError('Provider not found')
        }

        return this.providers[0]
    }
}
