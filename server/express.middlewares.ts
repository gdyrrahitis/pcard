import { Application } from "express";

export function registerMiddlewares(target: Application, actions: Action<any>[]) {
    actions.forEach(e => {
        target.use(<any>e());
    });
};