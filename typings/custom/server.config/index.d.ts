// declare module 'server.config.json!json' {
//     var json: ServerConfiguration;
//     export = json;
// }

declare module ServerAppConfig {

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

    interface Socket {
        maxRoomsAllowed: number
    }

    export interface ServerConfiguration {
        staticResources: StaticResources,
        server: Server,
        socketio: Socket
    }
}