declare module ClientAppConfig {
    interface Route {
        path: string,
        templateUrl: string,
        controller: string
    }

    interface Client {
        baseUrl: string,
        basePath: string,
        routes: Route[],
        html5Mode: boolean
    }

    interface Poker {
        mountainGoat: string[]
    }

    export interface ClientConfiguration {
        poker: Poker,
        client: Client
    }
}
