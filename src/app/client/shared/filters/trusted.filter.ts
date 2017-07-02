import * as angular from "angular";

export function TrustedFilter($sce: ng.ISCEService): ITrustedFilter {
    return (url: string): string => {
        return $sce.trustAsResourceUrl(url);
    };
}
TrustedFilter.$inject = ["$sce"];