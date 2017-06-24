import * as io from "socket.io-client";
const config: ClientAppConfig.ClientConfiguration = require("./client.config.json");

export const socket = io.connect(config.client.baseUrl);
