export interface ConnectionIdentifierInterface {
    getIdentifier: (tenant: any /* TenantInterface */) => Promise<string>
}
