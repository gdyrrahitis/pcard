import { Config } from "protractor";

export var config: Config = {
    framework: "jasmine",
    seleniumAddress: "http://localhost:4444/wd/hub",
    specs: ["specs/**/*.spec.js"]
};