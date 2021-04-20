import { RuntimeError } from '../../error'
import { FeatureProviderConfigInterface } from '../feature-provider-config.interface'
import { FeatureStrategyInterface } from './feature-strategy.interface'


export abstract class FeatureStrategy implements FeatureStrategyInterface {

    constructor(
        protected providers: Array<FeatureProviderConfigInterface>,
    ) {
    }

    public getProviderConfig(opts?: any): FeatureProviderConfigInterface {
        throw new RuntimeError('Not Implemented')
    }
}
