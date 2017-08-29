import * as express from "express";
import * as request from "supertest";
import { routes } from "../routes/room.routes";

describe("Server", () => {
    const app = express();
    const route = routes.rooms.route;

    describe("Express", () => {
        describe("Routes", () => {
            describe("routes.rooms.route", () => {
                beforeEach(() => {
                    app.use("/rooms", route);
                });

                it("should return 404 not found for non-existent route", (done) => {
                    request(app)
                        .get("/rooms/1")
                        .expect(404, done);
                });

                it("should return 200 response with body { limit: 10000 }", (done) => {
                    request(app)
                        .get("/rooms")
                        .set("Accept", "application/json")
                        .expect(200)
                        .expect({
                            limit: 10000
                        })
                        .end(done);
                });
            });
        });
    });
});