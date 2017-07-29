import * as angular from "angular";

import { HomeModule } from "./home.module";
import {
    RoomsFullEvent, RoomNotFoundEvent, InternalServerErrorEvent, RoomCreateEvent,
    RoomsAllEvent, UsersAllEvent, RequestAllRoomsEvent, RequestAllUsersEvent, RoomJoinEvent
} from "../../../domain/events/index";


describe("Home", () => {
    let createComponent: (name: string, locals: any, bindings: any) => any;
    let httpService: IHttpService;
    let $rootScope: ng.IRootScopeService;
    let scope: ng.IScope;
    let socketService: ISocketService;
    let socket;
    let $uibModal: ng.ui.bootstrap.IModalService;
    let notificationService: INotificationService;
    let $compile: ng.ICompileService;
    let $location: ng.ILocationService;

    beforeEach(() => {
        socket = function ($rootScope: ng.IScope) {
            let events: { eventName: string, callback: any }[] = [];
            let on = (eventName: string, callback: any) => {
                events.push({ eventName: eventName, callback: callback });
            };

            let emit = (eventName: string, data: any, done: Function) => {
                let event = events.filter(evt => evt.eventName === eventName)[0];
                if (event) {
                    event.callback(data, done);
                }
            };
            return {
                on: on,
                emit: emit,
                socketId: "socketId1234"
            };
        };
    })
    beforeEach(angular.mock.module(HomeModule));
    beforeEach(angular.mock.module("./home.html"));
    beforeEach(angular.mock.module("./modal.html"));
    beforeEach(angular.mock.module("./users-info.html"));
    beforeEach(angular.mock.module("./rooms-info.html"));
    beforeEach(angular.mock.module(HomeModule, ($provide) => {
        $provide.decorator("socket", ["$delegate", "$rootScope", ($delegate, $rootScope) => {
            return socket($rootScope);
        }]);
    }));
    beforeEach(inject((_$componentController_: ng.IComponentControllerService, _notificationService_,
        _httpService_, _$rootScope_, _socketService_, _socket_, _$uibModal_, _$compile_, _$location_) => {
        createComponent = (name, locals, bindings) => _$componentController_(name, locals, bindings);
        httpService = _httpService_;
        $rootScope = _$rootScope_;
        socketService = _socketService_;
        socket = _socket_;
        $uibModal = _$uibModal_;
        notificationService = _notificationService_;
        $compile = _$compile_;
        $location = _$location_;
        scope = $rootScope.$new();
    }));

    describe("Component", () => {
        xdescribe("constructor", () => {
            it("should set total rooms on initialization", (done) => {
                // arrange
                let promise = Promise.resolve({
                    data: {
                        limit: 100
                    }
                });
                spyOn(httpService, "get").and.returnValue(promise);
                let component = createComponent("pcardHome", null, {});

                // act
                component.$onInit();

                // assert
                promise.then(() => {
                    expect(httpService.get).toHaveBeenCalledWith("/rooms");
                    expect(component.totalRooms).toBe(100);
                    done();
                });
            });

            it("should set push message to alert for rejection in initialization", (done) => {
                // arrange
                let promise = Promise.reject({ error: "Unhandled error" });
                spyOn(httpService, "get").and.returnValue(promise);
                let component = createComponent("pcardHome", null, {});

                // act
                component.$onInit();

                // assert
                promise.catch(() => {
                    expect(httpService.get).toHaveBeenCalledWith("/rooms");
                    expect(component.alerts.length).toBe(1);
                    expect(component.alerts[0].message).toBe("Oh snap! An error occured, please try again later");
                    done();
                });
            });

            it("should respond to rooms-full event", () => {
                // arrange
                spyOn(socketService, "on").and.callThrough();
                let component = createComponent("pcardHome", null, {});

                // act
                socket.emit(RoomsFullEvent.eventName);

                // assert
                expect(socketService.on).toHaveBeenCalledWith(RoomsFullEvent.eventName, jasmine.any(Function));
                expect(component.alerts.length).toBe(1);
                expect(component.alerts[0].message).toBe("All rooms are being used. Try again later!");
            });

            it("should respond to rooms-not-found event", () => {
                // arrange
                spyOn(socketService, "on").and.callThrough();
                let component = createComponent("pcardHome", null, {});

                // act
                socket.emit(RoomNotFoundEvent.eventName);

                // assert
                expect(socketService.on).toHaveBeenCalledWith(RoomNotFoundEvent.eventName, jasmine.any(Function));
                expect(component.alerts.length).toBe(1);
                expect(component.alerts[0].message).toBe("Could not find room");
            });

            it("should respond to internal-server-error event", () => {
                // arrange
                spyOn(socketService, "on").and.callThrough();
                let error: Exception = { id: "1234", message: "UnhandledError", name: "Error" };
                let component = createComponent("pcardHome", null, {});

                // act
                socket.emit(InternalServerErrorEvent.eventName, error);

                // assert
                expect(socketService.on).toHaveBeenCalledWith(InternalServerErrorEvent.eventName, jasmine.any(Function));
                expect(component.alerts.length).toBe(1);
                expect(component.alerts[0].message).toBe(error.message);
            });

            it("should set the rooms property from rooms-all event", () => {
                // arrange
                spyOn(socketService, "on").and.callThrough();
                let rooms: number = 100;
                let component = createComponent("pcardHome", null, {});

                // act
                socket.emit(RoomsAllEvent.eventName, rooms);

                // assert
                expect(socketService.on).toHaveBeenCalledWith(RoomsAllEvent.eventName, jasmine.any(Function));
                expect(component.rooms).toBe(rooms);
            });

            it("should set the users property from users-all event", () => {
                // arrange
                spyOn(socketService, "on").and.callThrough();
                let users: number = 50;
                let component = createComponent("pcardHome", null, {});

                // act
                socket.emit(UsersAllEvent.eventName, users);

                // assert
                expect(socketService.on).toHaveBeenCalledWith(UsersAllEvent.eventName, jasmine.any(Function));
                expect(component.users).toBe(users);
            });

            it("should emit request-all-rooms event to set rooms through rooms-all", (done) => {
                // arrange
                let rooms: number = 100;
                spyOn(socketService, "on").and.callThrough();
                let component = createComponent("pcardHome", null, {});
                socket.on(RequestAllRoomsEvent.eventName, () => {
                    socket.emit(RoomsAllEvent.eventName, rooms);

                    // assert
                    expect(socketService.on).toHaveBeenCalledWith(RoomsAllEvent.eventName, jasmine.any(Function));
                    expect(component.rooms).toBe(rooms);
                    done();
                });

                // act
                component.$onInit();
            });

            it("should emit request-all-users event to set users through users-all", (done) => {
                // arrange
                let users: number = 50;
                spyOn(socketService, "on").and.callThrough();
                let component = createComponent("pcardHome", null, {});
                socket.on(RequestAllUsersEvent.eventName, () => {
                    socket.emit(UsersAllEvent.eventName, users);

                    // assert
                    expect(socketService.on).toHaveBeenCalledWith(UsersAllEvent.eventName, jasmine.any(Function));
                    expect(component.users).toBe(users);
                    done();
                });

                // act
                component.$onInit();
            });
        });

        xdescribe("createRoom", () => {
            it("should emit 'room-create' when createRoom is called and username is valid", () => {
                // arrange
                spyOn(socketService, "emit");
                let component = createComponent("pcardHome", null, {});
                component.username = "George";

                // act
                component.create();

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("room-create", { name: "George" }, jasmine.any(Function));
            });

            it("should not emit 'room-create' when createRoom is called with no username", () => {
                // arrange
                spyOn(socketService, "emit");
                let component = createComponent("pcardHome", null, {});

                // act
                component.create();

                // assert
                expect(socketService.emit).not.toHaveBeenCalled();
                expect(component.alerts.length).toBe(1);
                expect(component.alerts[0].message).toBe("Please provide a username");
            });
        });

        xdescribe("join", () => {
            it("should emit 'room-join' when join is called and roomId and username are valid", () => {
                // arrange
                spyOn(socketService, "emit");
                let component = createComponent("pcardHome", null, {});
                component.username = "George";

                // act
                component.join("1234");

                // assert
                expect(socketService.emit).toHaveBeenCalledWith("room-join", { roomId: "1234", name: "George" }, jasmine.any(Function));
            });

            it("should not emit 'room-join' when join is called with valid roomId but no username", () => {
                // arrange
                spyOn(socketService, "emit");
                let component = createComponent("pcardHome", null, {});

                // act
                component.join("1234");

                // assert
                expect(socketService.emit).not.toHaveBeenCalled();
                expect(component.alerts.length).toBe(1);
                expect(component.alerts[0].message).toBe("Please provide a username");
            });

            it("should not emit 'room-join' when join is called and roomId is not valid", () => {
                // arrange
                spyOn(socketService, "emit");
                let component = createComponent("pcardHome", null, {});
                component.username = "George";

                // act
                component.join(undefined);

                // assert
                expect(socketService.emit).not.toHaveBeenCalled();
                expect(component.alerts.length).toBe(1);
                expect(component.alerts[0].message).toBe("Room id is not valid, please provide one");
            });
        });

        xdescribe("modal", () => {
            it("should open modal", () => {
                // arrange
                spyOn($uibModal, "open").and.callThrough();
                let component = createComponent("pcardHome", null, {});

                // act
                component.modal();

                // assert
                expect($uibModal.open).toHaveBeenCalled();
            });

            it("should resolve on close", (done) => {
                // arrange
                let p = Promise.resolve("123");
                spyOn($uibModal, "open").and.returnValue({ result: Promise.resolve(p) });
                let component = createComponent("pcardHome", null, {});
                spyOn(component, "join");

                // act
                component.modal();

                // assert
                expect($uibModal.open).toHaveBeenCalled();
                p.then(() => {
                    expect(component.join).toHaveBeenCalledWith("123");
                    done();
                });
            });

            it("should reject on dismiss", (done) => {
                // arrange
                let promise = Promise.reject("dismiss");
                spyOn($uibModal, "open").and.returnValue({ result: Promise.reject(promise) });
                let component = createComponent("pcardHome", null, {});
                spyOn(notificationService, "info");

                // act
                component.modal();

                // assert
                expect($uibModal.open).toHaveBeenCalled();
                promise.catch(() => {
                    expect(notificationService.info).toHaveBeenCalledWith("User dismissed dialog", "Dismiss", { progressBar: true });
                    done();
                });
            });
        });

        describe("template", () => {
            beforeEach(() => {
                scope = $rootScope.$new();
            });

            xit("should not display total users when zero", () => {
                // arrange
                let element = angular.element("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);

                // act
                scope.$digest();
                let users = angular.element(template[0].querySelector("pcard-users-info > div"));

                // assert
                expect(users.hasClass("ng-hide")).toBeTruthy();
            });

            xit("should display total users after socket.io emits the connected users", () => {
                // arrange
                let element = angular.element("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);

                // act
                scope.$digest();
                socket.emit(UsersAllEvent.eventName, 10);
                let users = angular.element(template[0].querySelector(".users"));

                // assert
                expect(users.text()).toBe("10");
            });

            xit("should not display rooms when total rooms is zero", (done) => {
                // arrange
                let promise = Promise.resolve({ data: { limit: 0 } });
                spyOn(httpService, "get").and.returnValue(promise);
                let element = angular.element("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);

                // act
                scope.$digest();
                socket.emit(RoomsAllEvent.eventName, 100);

                promise.then(() => {
                    scope.$digest();
                    let rooms = angular.element(template[0].querySelector("pcard-rooms-info > div"));

                    // assert
                    expect(rooms.hasClass("ng-hide")).toBeTruthy();
                    done();
                });
            });

            xit("should display rooms", (done) => {
                // arrange
                let promise = Promise.resolve({ data: { limit: 100 } });
                spyOn(httpService, "get").and.returnValue(promise);
                let element = angular.element("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);

                // act
                scope.$digest();
                socket.emit(RoomsAllEvent.eventName, 50);

                promise.then(() => {
                    scope.$digest();
                    let rooms = angular.element(template[0].querySelector(".rooms"));

                    // assert
                    expect(rooms.text()).toBe("50");
                    done();
                });
            });

            xit("should have create room and join room buttons disabled", () => {
                // arrange
                let element = angular.element("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);
                scope.$digest();

                // act
                let buttons = angular.element(template[0].querySelectorAll("button"));

                // assert
                expect(buttons.prop("disabled")).toBeTruthy();
            });

            xit("should not enable buttons when name is invalid and show 'Please provide a valid name' message", () => {
                // arrange
                let element = angular.element("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);
                scope.$digest();
                let input = angular.element(template.find("input"));

                // act
                input.val("%^&*$").triggerHandler("input");
                scope.$apply();
                let buttons = angular.element(template[0].querySelectorAll("button"));
                let message = angular.element(template[0].querySelector(".form-group > span:nth-of-type(2)"));

                // assert
                expect(angular.element(template[0].querySelector(".form-group")).hasClass("has-error")).toBeTruthy();
                expect(input.hasClass("ng-invalid")).toBeTruthy();
                expect(message.hasClass("ng-hide")).toBeFalsy();
                expect(message.text()).toBe("Please provide a valid name");
                expect(angular.element(template[0].querySelector(".form-group > span:nth-of-type(1)")).hasClass("ng-hide")).toBeTruthy();
                expect(buttons.prop("disabled")).toBeTruthy();
            });

            xit("should not enable buttons when name is entered and then removed and show 'Name is required' message", () => {
                // arrange
                let element = angular.element("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);
                scope.$digest();
                let input = angular.element(template.find("input"));

                // act
                input.val("george").triggerHandler("input");
                scope.$apply();
                input.val("").triggerHandler("input");
                scope.$apply();
                let buttons = angular.element(template[0].querySelectorAll("button"));
                let message = angular.element(template[0].querySelector(".form-group > span:nth-of-type(1)"));

                // assert
                expect(angular.element(template[0].querySelector(".form-group")).hasClass("has-error")).toBeTruthy();
                expect(input.hasClass("ng-invalid")).toBeTruthy();
                expect(message.hasClass("ng-hide")).toBeFalsy();
                expect(message.text()).toBe("Name is required");
                expect(angular.element(template[0].querySelector(".form-group > span:nth-of-type(2)")).hasClass("ng-hide")).toBeTruthy();
                expect(buttons.prop("disabled")).toBeTruthy();
            });

            xit("should enable buttons when name is added", () => {
                // arrange
                let element = angular.element("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);
                scope.$digest();
                let input = angular.element(template.find("input"));

                // act
                input.val("george").triggerHandler("input");
                scope.$apply();
                let buttons = angular.element(template[0].querySelectorAll("button"));
                let message = angular.element(template[0].querySelector(".form-group > span"));

                // assert
                expect(angular.element(template[0].querySelector(".form-group")).hasClass("has-error")).toBeFalsy();
                expect(message.hasClass("ng-hide")).toBeTruthy();
                expect(buttons.prop("disabled")).toBeFalsy();
            });

            xit("should go to rooms when create room is clicked", (done) => {
                socket.on(RoomCreateEvent.eventName, (data, callback: Function) => {
                    // assert
                    callback({ access: true, roomId: "1234" });
                    expect($location.path()).toBe("/room/1234");
                    done();
                });

                // arrange
                let element = angular.element("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);
                scope.$digest();
                let input = angular.element(template.find("input"));

                // act
                input.val("george").triggerHandler("input");
                scope.$apply();
                let button = angular.element(template[0].querySelectorAll("button:nth-of-type(1)"));
                button.triggerHandler("click");
            });

            xit("should open modal when join is clicked", () => {
                // arrange
                let element = angular.element(document.body).append("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);
                scope.$digest();
                let input = angular.element(template.find("input"));
                input.val("george").triggerHandler("input");
                scope.$apply();
                let button = angular.element(template[0].querySelectorAll(".btn-group.btn-group-lg > button:nth-of-type(2)"));

                // act
                button.triggerHandler("click");
                scope.$digest();
                let body = angular.element(template[0]).parent("html").find("body");

                // assert
                expect(body.hasClass("modal-open")).toBeTruthy();
            });

            xit("should dismiss modal when cancel is clicked and still be at home page", () => {
                // arrange
                let element = angular.element(document.body).append("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);
                scope.$digest();
                let input = angular.element(template.find("input"));
                input.val("george").triggerHandler("input");
                scope.$apply();
                let button = angular.element(template[0].querySelectorAll(".btn-group.btn-group-lg > button:nth-of-type(2)"));

                // act
                button.triggerHandler("click");
                scope.$digest();
                let cancel = angular.element(template[0].querySelector(".modal-footer > .btn-warning"));
                cancel.triggerHandler("click");
                scope.$digest();
                let body = angular.element(template[0]).parent("html").find("body");

                // assert
                expect(body.hasClass("modal-open")).toBeFalsy();
            });

            xit("should navigate to certain room when handle is passed", (done) => {
                socket.on(RoomJoinEvent.eventName, (data, callback: Function) => {
                    // assert
                    callback({ access: true, roomId: "1234" });
                    expect($location.path()).toBe("/room/1234");
                    done();
                });

                // arrange
                let element = angular.element(document.body).append("<pcard-home></pcard-home>");
                let template = $compile(element)(scope);
                scope.$digest();
                let input = angular.element(template.find("input"));
                input.val("george").triggerHandler("input");
                scope.$apply();
                let button = angular.element(template[0].querySelectorAll(".btn-group.btn-group-lg > button:nth-of-type(1)"));

                // act
                button.triggerHandler("click");
                scope.$digest();
                let roomId = angular.element(template[0].querySelector(".modal-body > input"));
                roomId.val("1234").triggerHandler("input");
                scope.$apply();
                let ok = angular.element(template[0].querySelector(".modal-footer > .btn-primary"));
                ok.triggerHandler("click");
                scope.$digest();
                let body = angular.element(template[0]).parent("html").find("body");
console.log(body[0])
                // assert
                expect(body.hasClass("modal-open")).toBeFalsy();
            });
        });
    });

    xdescribe("Module", () => {
        it("should resolve rooms info component", () => {
            let component = createComponent("pcardRoomsInfo", null, {});
            expect(component).toBeDefined();
        });

        it("should resolve users info component", () => {
            let component = createComponent("pcardUsersInfo", null, {});
            expect(component).toBeDefined();
        });

        it("should resolve home component", () => {
            let component = createComponent("pcardHome", null, {});
            expect(component).toBeDefined();
        });
    });
});