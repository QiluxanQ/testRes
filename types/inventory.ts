export interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    metadate: Record<string, any> | null;
}
export interface Unit {
    id: number;
    point_retail_id: number;
    name: string;
    symbol: string;
    metadate: Record<string, any> | null;
}
export interface Product {
    id: number;
    point_retail_id: number;
    categories_products_id: number;
    name: string;
    sku: string;
    barcode: string;
    type: string;
    unit_id: number;
    expiration_date: string;
    purchase_price: string;
    is_active: boolean;
    metadate: Record<string, any>;
    create_at: string;
}
export interface Inventory {
    id: number;
    storage_id: number;
    product_id: number;
    quantity: string;
    unit_id: number;
    metadate: Record<string, any>;
}
export interface Storage {
    id: number;
    name: string;
    parent_id: string;
    warehouse_id: number;
    type: string;
    metadate: Record<string, any>;
}
export interface PointRetail {
    id: number;
    warehouse_id: number;
    organizations_id: number;
    name: string;
    address: string;
    type: string;
    metadate: Record<string, any> | null;
    create_at: string;
}
export interface InventoryItem extends Product {
    currentStock: number;
    unit: string;
    storage_id?: number;
    inventory_id?: number;
}
export interface Batch {
    id: number;
    quantity: number;
    purchasePrice: number;
    receivedDate: string;
    expiryDate: string;
    daysUntilExpiry: number;
    batchNumber: string;
    supplier: string;
}
export interface StockItem {
    id: number;
    name: string;
    category: string;
    totalStock: number;
    unit: string;
    minStock: number;
    optimalStock: number;
    avgPrice: number;
    turnoverRate: number;
    daysInStock: number;
    wastePercentage: number;
    batches: Batch[];
    product_id?: number;
    storage_id?: number;
    quantity?: string;
}
export interface Movement {
    id: string;
    date: string;
    type: 'income' | 'outcome' | 'writeoff';
    item: string;
    quantity: number;
    unit: string;
    supplier?: string;
    batchNumber?: string;
    orderId?: string;
    reason?: string;
    total?: number;
    user: string;
    userId?: number;
}
export interface InventoryDataItem {
    id: number;
    name: string;
    system: number;
    actual: number;
    difference: number;
    unit: string;
    inventory_id?: number;
    product_id?: number;
}
export interface User {
    id: number;
    username: string;
    name: string;
}
export interface InventoryRecord {
    name: string;
    warehouse_id: number;
    user_id: number;
    date_start: string;
    date_end: string;
    count_product: string;
    metadate: any;
    id: number;
}
export interface NewInventory {
    name: string;
    warehouse_id: number;
    user_id: number;
    date_start: string;
    date_end?: string;
    count_product: string;
    metadate?: any;
}
export interface Price {
    products_id: number;
    value: string;
    currency: string;
    price_type: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    metadate: any;
    id: number;
}
export interface ProductBatch {
    warehouse_id: number;
    receipt_invoice_id: number;
    quantity: string;
    unit_id: number;
    name: string;
    status: string;
    date: string;
    metadate: any;
    id: number;
}
export interface ProductBatchItem {
    product_batch_id: number;
    storage_id: number | null;
    product_id: number;
    quantity: string;
    unit_id: number;
    expiration_date: string;
    metadate: any;
    id: number;
}
export interface Warehouse {
    name: string;
    address: string;
    type: string;
    metadate: any;
    id: number;
}
export interface InventoryItemAPI {
    inventory_id: number;
    storage_id: number;
    product_id: number;
    expected_quantity: string;
    actual_quantity: string;
    unit_id: number;
    metadate: any;
    id: number;
}
export interface Counterparty {
    id: number;
    point_retail_id: number;
    name: string;
    full_name: string;
    type: string;
    inn: string;
    kpp: string;
    ogrn: string;
    legal_address: string;
    actual_address: string;
    phone: string;
    email: string;
    website: string;
    vat: string;
    egais: boolean;
    honest_sign: boolean;
    metadate: any;
    create_at: string;
    update_at: string;
}