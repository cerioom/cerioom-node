export type SessionValueType = string | number | boolean

export interface SessionStorageInterface {
    get<T extends SessionValueType>(key: string, defaultValue?: SessionValueType): Promise<T> // Return the value for a given key (accepts an optional default value)
    set(key: string, value: SessionValueType): Promise<void> // Add a key/value pair to the session store
    all(): Promise<Record<string, SessionValueType>> // Get everything back as an object from the session store
    remove(key: string): Promise<SessionValueType> // Remove and return a key/value pair from the session store
    clear(): Promise<boolean>
    touch(): void
}
