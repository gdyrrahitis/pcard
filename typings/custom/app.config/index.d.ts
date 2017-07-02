declare module ClientAppConfig {
    interface Client {
        baseUrl: string
    }

    export interface ClientConfiguration {
        client: Client
    }
}
