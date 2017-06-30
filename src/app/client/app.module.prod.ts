import angular from "angular";

import { AppModule } from "./app.module";

angular.module(AppModule).config(["$compileProvider", ($compileProvider: ng.ICompileProvider) => {
    $compileProvider.debugInfoEnabled(false);
    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);
}])