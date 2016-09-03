import { Action } from "./common/Types";

export function registerMiddlewares(target: any, actions: Action<void>[]) {
    actions.forEach(e => {
        target.use(e());
    });
};