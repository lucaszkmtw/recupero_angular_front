interface JQuery {
    jqGrid: any;
    fileinput: any;
    CKFinder: any;
    tableDnD: any;
    kendoWindow: any;
    kendoTreeView: any;
    kendoGrid: any;
    tableDnDUpdate: any;
    select2: any;
    size: any;
    slimScroll: any;
    confirmation: any;
    tabdrop: any;
    fancybox: any;
    dropdownHover: any;
    tooltip: any;
    uniform: any;
    iCheck: any;
    sortable: any;
    block: any;
    blockUI: any;
    unblock: any;
    unblockUI: any;
    bootstrapSwitch: any;
    viewer: any;
}

interface JQueryStatic {
    jgrid: any;
    jqGrid: any;
    cookie: any;
    fancybox: any;
    notific8: any;
    blockUI: any;
    unblockUI: any;
    uniform: any;
}

interface IAugmentedJQuery {
    select2: any;
}

interface Window { mui: any; }

interface IGridModel {
    colNames: string[];
    colModel: Array<any>;
}

interface IHasId {
    id: number;
}

interface IUser {
    id: number;
}

interface IHasIdAndName {
    id: number;
    name: string;
}

interface ISession {
    tenantId: number,
    tenants: any[],
    tenant, any,
    roles: string[];
    activities: string[];
    permissions: string[];
    isInRole: (roleName: string) => boolean;
    logOut: (success: any, error: any) => void;
    impersonate: (id: any, name: any, rol: any, success: any, error: any) => void;
    isAdmin: () => boolean;
    reload: (success?: any, error?: any) => void;
}

declare var parentIFrame: any;
declare var moment: Function;
declare var google: any;
declare var FastClick: any;
declare var navigaror: any;
declare var kendo: any;
declare var jsRequires: any;
declare var Flow: any;
declare var location: Location;
declare var toastr: any;
declare var Layout: any;
declare var Metronic: any;
declare var QuickSidebar: any;