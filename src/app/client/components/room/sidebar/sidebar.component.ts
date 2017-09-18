import * as angular from "angular";

export const SidebarComponent: ng.IComponentOptions = {
    templateUrl: "./sidebar.html",
    controller: class SidebarComponent implements ng.IController, ISidebarComponent {
        public readonly buttons: Button[] = [
            { id: "planning-start", show: true, active: true },
            { id: "planning-reset", show: false, active: true },
            { id: "planning-stop", show: false, active: true },
            { id: "planning-lock", show: false, active: true },
            { id: "planning-unlock", show: false, active: false },
            { id: "planning-show", show: false, active: false }
        ];

        constructor() { }

        public startPlanning(): void {
            const planningStart = this.getPlanningStart();
            planningStart.show = false;

            this.buttons
                .filter(b => b.id !== "planning-start")
                .filter(b => b.id !== "planning-lock")
                .filter(b => b.id !== "planning-unlock")
                .filter(b => b.id !== "planning-show")
                .forEach(b => b.show = true);
        }

        private getPlanningStart() {
            return this.getFromButtons("planning-start");
        }

        private getFromButtons(id: string) {
            const [btn] = this.buttons.filter(b => b.id === id);
            return btn;
        }

        public resetPlanning(): void {
            // TODO: Should add business logic
            if (this.getPlanningStart().show) {
                return;
            }
        }

        public stopPlanning(): void {
            if (this.getPlanningStart().show) {
                return;
            }

            this.buttons
                .filter(b => b.id !== "planning-start")
                .filter(b => b.id !== "planning-reset")
                .forEach(b => b.show = false);

            const planningStart = this.getPlanningStart();
            const planningReset = this.getFromButtons("planning-reset");
            planningStart.show = true;
            planningReset.show = true;
        }

        public planningLock(): void {
            if (this.getPlanningStart().show) {
                return;
            }

            const planningLock = this.getFromButtons("planning-lock");
            planningLock.show = false;

            const planningUnlock = this.getFromButtons("planning-unlock");
            planningUnlock.show = true;

            const planningShow = this.getFromButtons("planning-show");
            planningShow.show = true;
            planningShow.active = true;
        }

        public planningUnlock(): void {
            if (this.getPlanningStart().show || this.getFromButtons("planning-lock").show) {
                return;
            }

            const planningLock = this.getFromButtons("planning-lock");
            planningLock.show = true;

            const planningUnlock = this.getFromButtons("planning-unlock");
            planningUnlock.show = false;

            const planningShow = this.getFromButtons("planning-show");
            planningShow.active = false;
        }

        public planningShow(): void {}
    }
};