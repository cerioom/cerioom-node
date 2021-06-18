import { ConnectionIdentifierInterface } from './connection-identifier.interface'


export class ConnectionIdentifier implements ConnectionIdentifierInterface {
    public async getIdentifier(tenant: any/* TenantInterface */): Promise<string> {
        return tenant.tenantId;
    }
}
