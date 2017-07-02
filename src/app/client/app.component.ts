export const AppComponent: ng.IComponentOptions = {
    template: `
    <div class="container">
        <pcard-header></pcard-header>
        <ng-view></ng-view>
        <pcard-footer></pcard-footer>
    </div>
    `
}