export interface ApiPrecheck {
    id: number;
    point_retail_id: number;
    name: string;
    type: string;
    vat: string;
    is_activ: boolean;
    metadate: {
        receiptFormat?: string;
        receiptCopies?: number;
        receiptTitle?: string;
        receiptFooter?: string;
        receiptPhone?: string;
        receiptWebsite?: string;
        showQrCode?: boolean;
        autoPrintReceipt?: boolean;
        printPrecheck?: boolean;
        showDiscounts?: boolean;
        showWaiter?: boolean;
        emailReceipts?: boolean;
        [key: string]: any;
    };
}
export interface PrecheckFormData {
    point_retail_id: number;
    name: string;
    type: string;
    vat: string;
    is_activ: boolean;
    receiptFormat: string;
    receiptCopies: number;
    receiptTitle: string;
    receiptFooter: string;
    receiptPhone: string;
    receiptWebsite: string;
    showQrCode: boolean;
    autoPrintReceipt: boolean;
    printPrecheck: boolean;
    showDiscounts: boolean;
    showWaiter: boolean;
    emailReceipts: boolean;
}
export interface ApiPointRetail {
    id: number;
    warehouse_id: number;
    organizations_id: number;
    name: string;
    address: string;
    type: string;
    metadate: any;
    create_at: string;
}
export interface ApiWarehouse {
    id: number;
    name: string;
    address: string;
    type: string;
    metadate: any;
}
export interface PointRetailFormData {
    name: string;
    address: string;
    type: string;
    warehouse_id: number | null;
    organizations_id: number;
}
export interface WarehouseFormData {
    name: string;
    address: string;
    type: string;
}
export interface ApiPrinter {
    id: number;
    point_retail_id: number;
    name: string;
    ip_address: string;
    port: string;
    kitchen_name: string;
    is_activ: boolean;
    metadate: {
        autoPrint?: boolean;
        soundSignal?: boolean;
        printCookingTime?: boolean;
        paperWidth?: string;
        copies?: number;
        [key: string]: any;
    };
}
export interface PrinterFormData {
    point_retail_id: number;
    name: string;
    ip_address: string;
    port: string;
    kitchen_name: string;
    is_activ: boolean;
    // Поля для metadata
    autoPrint: boolean;
    soundSignal: boolean;
    printCookingTime: boolean;
    paperWidth: string;
    copies: number;
}
export interface Organization {
    Full_name: string;
    inn: string;
    kpp: string;
    ogrn: string;
    legal_address: string;
    actual_address: string;
    phone: string;
    email: string;
    website: string;
    nds: number;
    metadate: {
        companyType?: string;
        okpo?: string;
        directorName?: string;
        directorPosition?: string;
        bankName?: string;
        bik?: string;
        accountNumber?: string;
        corrAccount?: string;
        [key: string]: any;
    };
    id: number;
    create_at: string;
    update_at: string;
}
export interface ApiEgais {
    id: number;
    point_retail_id: number;
    name: string;
    ip_address: string;
    port: string;
    is_activ: boolean;
    metadate: {
        egaisUrl?: string;
        egaisLogin?: string;
        egaisPassword?: string;
        fsrarId?: string;
        egaisOrgType?: string;
        enableIntegration?: boolean;
        autoSendTtn?: boolean;
        checkBalance?: boolean;
        recordSales?: boolean;
        syncInterval?: string;
        [key: string]: any;
    };
}
export interface EgaisFormData {
    point_retail_id: number;
    name: string;
    ip_address: string;
    port: string;
    is_activ: boolean;
    egaisUrl: string;
    egaisLogin: string;
    egaisPassword: string;
    fsrarId: string;
    egaisOrgType: string;
    enableIntegration: boolean;
    autoSendTtn: boolean;
    checkBalance: boolean;
    recordSales: boolean;
    syncInterval: string;
}
export interface ApiMarking {
    id: number;
    point_retail_id: number;
    name: string;
    ip_address: string;
    port: string;
    is_activ: boolean;
    metadate: {
        markingUrl?: string;
        markingToken?: string;
        markingInn?: string;
        markingOgrn?: string;
        productGroups?: string[];
        scannerType?: string;
        enableMarking?: boolean;
        checkOnSale?: boolean;
        withdrawalFromCirculation?: boolean;
        blockSaleWithoutCode?: boolean;
        errorNotifications?: boolean;
        [key: string]: any;
    };
}
export interface MarkingFormData {
    point_retail_id: number;
    name: string;
    ip_address: string;
    port: string;
    is_activ: boolean;
    markingUrl: string;
    markingToken: string;
    markingInn: string;
    markingOgrn: string;
    productGroups: string[];
    scannerType: string;
    enableMarking: boolean;
    checkOnSale: boolean;
    withdrawalFromCirculation: boolean;
    blockSaleWithoutCode: boolean;
    errorNotifications: boolean;
}

export interface ApiEgaisType {
    id: number;
    point_retail_id: number;
    name: string;
    ip_address: string;
    port: string;
    is_activ: boolean;
    metadate: {
        egaisUrl: string;
        egaisLogin: string;
        egaisPassword: string;
        fsrarId: string;
        egaisOrgType: string;
        enableIntegration: boolean;
        autoSendTtn: boolean;
        checkBalance: boolean;
        recordSales: boolean;
        syncInterval: string;
    };
}
export interface ApiTerminalType {
    id: number;
    point_retail_id: number;
    name: string;
    ip_address: string;
    port: string;
    is_activ: boolean;
    metadate: {
        terminalProvider: string;
        terminalModel: string;
        terminalId: string;
        merchantId: string;
        terminalApiKey: string;
        connectionType: string;
        enableCardPayments: boolean;
        contactlessPayments: boolean;
        tipsEnabled: boolean;
        tipPercentages: string;
        printSlip: boolean;
        autoReconciliation: boolean;
    };
}