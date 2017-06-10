import { pcard } from "./main";
pcard.application.config(["$compileProvider", ($compileProvider: ng.ICompileProvider) => {
    $compileProvider.debugInfoEnabled(false);
    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);
}])