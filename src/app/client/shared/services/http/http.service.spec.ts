import * as angular from "angular";

import { SharedModule } from "../../shared.module";
import { HttpService } from "./http.service";

describe("Services", () => {
    describe("HttpService", () => {
        let $httpBackend: ng.IHttpBackendService;
        let service: HttpService;

        beforeEach(angular.mock.module(SharedModule));
        beforeEach(inject(($injector) => {
            $httpBackend = $injector.get("$httpBackend");
            service = $injector.get("httpService");
        }));

        afterEach(() => {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe("get", () => {
            it("should return 404 not found for non-existent endpoint", () => {
                // arrange
                $httpBackend.whenGET("/fake").respond(404, { error: "Not found" });

                // act
                service.get("/fake").catch((response) => {
                    // assert
                    expect(response.status).toBe(404);
                    expect(response.data.error).toBe("Not found");
                });
                $httpBackend.flush();
            });

            it("should return response 200 OK for existent endpoint with body", () => {
                // arrange
                $httpBackend.whenGET("/api/room/limit").respond(200, 10000);

                // act
                service.get("/api/room/limit").then((response) => {
                    // assert
                    expect(response.status).toBe(200);
                    expect(response.data).toBe(10000);
                });

                $httpBackend.flush();
            });
        });
    });
});