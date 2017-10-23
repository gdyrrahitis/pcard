import "./styles/variables.scss";
import "./styles/bootstrap.scss";
import "./styles/custom-font-awesome.scss";
import "./styles/main.scss";
import "../../../node_modules/toastr/build/toastr.css";

export const AppComponent: ng.IComponentOptions = {
    template: `
    <div class="container">
        <pcard-header></pcard-header>
        <ui-view></ui-view>
        <pcard-footer></pcard-footer>
    </div>
    `
}