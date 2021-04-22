import { ConfigFeatureProvider } from './config-feature-provider'


export class LoggerProvider extends ConfigFeatureProvider {
    public async do(...args: any[]): Promise<any> {
        return this.log.info(args)
    }
}
