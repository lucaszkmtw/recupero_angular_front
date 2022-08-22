interface ICommand {
    name: string;
    caption: string;
}

interface IScreenScope extends ng.IScope {
    session: any;
    commands: ICommand[];
    options: any;
}

interface IBusinessDocumentScope extends IScreenScope {
    documentTypes: any;
    selectedDocumentType: any;
    document: any;
    documentStatus: any;
    messageServiceUrl: string;
    editorOptions: any;
    module: number;
    uploader: any; //Pasar a service a nivel application
    itemTypesEnum: any;
    paymentMethods: any;
    unitTypes: any;
    vatRates: any;
    tenantInventorySites: any;
    documentChanged: () => void;
    byOrderOfChanged: () => void;
    quantityChanged: (item: any) => void;
    unitPriceChanged: (item: any) => void;
    vatRateChanged: (item: any) => void;
    bonusChanged: (item: any) => void;
    doCalculations: (item: any) => void;
    addItem: (item: any) => void;
    isItemValid: (item: any) => boolean;
    resetNewItem: (item?: any) => void;
    openFile: (file: any) => void;
}

interface IFinancialDocumentScope extends IScreenScope {
    isPaymentMethodCash: any;
    _: any;
    documentTypes: any[];
    selectedDocumentType: any;
    document: any;
    documentStatus: any;
    messageServiceUrl: string;
    editorOptions: any;
    uploader: any; //Pasar a service a nivel application
    itemTypesEnum: any;
    paymentMethods: any;
    unitTypes: any;
    vatRates: any;
    byOrderOfChanged: () => void;
    amountChanged: (item: any) => void;
    doCalculations: () => void;
    addItem: () => void;
    removeItem: (item?: any) => void;
    isItemValid: (item: any) => boolean;
    addMethod: (paymentMethod:any) => void;
    removeMethod: (method?: any) => void;
    openFile: (file: any) => void;
    accounts: any;
}

interface IProcurementBusinessDocumentScope extends IScreenScope {
    document: any;
    submitForApproval: () => void;
    confirm: () => void;
    documentOptions: any;
    view: () => void;
    edit: () => void;
    save: () => void;
}

interface IProcurementBusinessDocumentApprovalScope extends IScreenScope {
    document: any;
    documentOptions: any;
    assign: (roleId:number) => void;
    approve: () => void;
    reject: () => void;
}

interface ILoansAuhtorizationScope extends IScreenScope {
    loan: any;
    options: any;
    assign: (roleId: number) => void;
    approve: () => void;
    reject: () => void;
}

interface ISalesBusinessDocumentScope extends IScreenScope {
    document: any;
    submitForApproval: () => void;
    documentOptions: any;
    edit: () => void;
    save: () => void;
}
interface ICreditBusinessDocumentScope extends IScreenScope {
    document: any;
    uploader;
    mode;
    settlementItems;
    creditorsIds;
    debtorsIds;
    limit;
    loadMore: ()=> void;
    serviceUrl;
    documentTypes;
    checkboxes: {
        all: boolean,
        current: boolean,
        prescribed: boolean
    };

    selectedAll: boolean;
    selectedCurrent: boolean;
    selectedExpired: boolean;
    showSettlement: (item)=> void;
    addNad: (item)=>void;
    addLiqIGB: (item)=>void;
    addLiqDGJ: (item)=>void;
    addTe: (item)=>void;
    addApremio: (item)=>void;
    submitForApproval: () => void;
    openCreditSelector: () => void;
    openSettlementDialog: () => void;
    removeSelectedItem:(item) => void;
    editSelectedItem:(item,index) => void;
    addSettlementItem:(item) => void;
    addAllSettlementItem:() => void;
    addCurrentSettlementItem:() => void;
    addExpiredSettlementItem: () => void;
    addLaws:(item,index) => void;
    canApprove: () => boolean;
    canGoBack: () => boolean;
    documentOptions: any;
    edit: () => void;
    save: () => void;
}
interface ISalesBusinessDocumentApprovalScope extends IScreenScope {
    document: any;
    documentOptions: any;
    assign: (roleId: number) => void;
    approve: () => void;
    reject: () => void;
}

interface IDispatchBusinessDocumentScope extends IScreenScope {
    document: any;
    submitForApproval: () => void;
    confirm: () => void;
    documentOptions: any;
    view: () => void;
    edit: () => void;
    save: () => void;
}

interface IOperationsAuhtorizationScope extends IScreenScope {
    operation: any;
    options: any;
    assign: (roleId: number) => void;
    approve: () => void;
    reject: () => void;
}

interface IFactoringClientScope extends IScreenScope {
    operation: any;
    options: any;
    assign: (roleId: number) => void;
    approve: () => void;
    reject: () => void;
}