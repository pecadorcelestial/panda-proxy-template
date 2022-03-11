export function getModuleFromPath(path: string): string {
    let result: string = '';
    switch(path) {
        case "/addresses":
        case "/address":
            result = "addresses";
            break;
        case "/clients":
        case "/client":
            result = "clients";
            break;
        case "/contactMeans":
        case "/contactMean":
        case "/contacts":
        case "/contact":
            result = "contacts";
            break;
        case "/contracts":
        case "/contract":
            result = "contracts";
            break;
        case "/prospects":
        case "/prospect":
        case "/prospectStatuses":
        case "/prospectStatus":
        case "/prospectTypes":
        case "/prospectType":
        case "/salesEventTypes":
        case "/salesEventType":
            result = "prospects";
            break;
        case "/quotations":
        case "/quotation":
        case "/quotationStatuses":
        case "/quotationStatus":
        case "/periodicities":
        case "/periodicity":
        case "/forcedTerms":
        case "/forcedTerm":
            result = "quotations";
            break;
        case "/schedules":
        case "/schedule":
            result = "schedules";
            break;
        case "/accounts":
        case "/account":
        case "/accountStatuses":
        case "/accountStatus":
        case "/accountTypes":
        case "/accountType":
            result = "accounts";
            break;
        case "/users":
        case "/user":
        case "/departments":
        case "/department":
        case "/modules":
        case "/module":
        case "/roles":
        case "/role":
            result = "users";
            break;
    }
    return result;
}