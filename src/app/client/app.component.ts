import "./styles/bootstrap.scss";

export const AppComponent: ng.IComponentOptions = {
    template: `
    <div class="container">
        <pcard-header></pcard-header>
        <ui-view></ui-view>
        <pcard-footer></pcard-footer>
    </div>
    `
}