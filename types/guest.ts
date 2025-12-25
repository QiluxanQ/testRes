export interface Guest {
    id: number;
    point_retail_id: number;
    full_name: string;
    phone: string;
    email: string;
    address: string;
    status: string;
    discount: number;
    amount_orders: string;
    date_at: string;

    category?: string;
    lastVisit?: string;
    totalVisits?: number;
    totalAmount?: number;
    averageCheck?: number;
    birthday?: string;
    preferences?: string[];
    allergies?: string[];
    notes?: string;
}