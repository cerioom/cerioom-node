import { SessionStorageInterface, SessionValueType } from './session-storage.interface'


export abstract class SessionStorageService implements SessionStorageInterface {
    public abstract all(): Promise<Record<string, SessionValueType>>

    public abstract clear(): Promise<boolean>

    public abstract get<T extends SessionValueType>(key: string, defaultValue?: SessionValueType): Promise<T>

    public abstract remove(key: string): Promise<SessionValueType>

    public abstract set(key: string, value: SessionValueType): Promise<void>

    public abstract touch(): void
}
