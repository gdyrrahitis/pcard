declare module 'app.config.json!json' {
    var json: AppConfig.Configuration;
    export = json;
}

declare module AppConfig {

    interface Directory {
        path: string,
        order: number
    }

    interface StaticResources {
        directories: Directory[],
        entry: string
    }

    interface Server {
        port: number
    }

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

    interface Socket {
        maxRoomsAllowed: number
    }

    export interface Configuration {
        staticResources: StaticResources,
        server: Server,
        client: Client,
        poker: Poker,
        socketio: Socket
    }
}