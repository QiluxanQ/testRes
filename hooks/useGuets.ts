

export const useGuets = (setCurrentGuest) => {

    const transformOrderData = (apiOrders: any[]) => {
        return apiOrders.map(order => ({
            id: order.transaction_id || `ORD-${order.id}`,
            date: order.date_open || order.date_close,
            items: order.count_positions || 0,
            amount: parseFloat(order.amount) || 0,
            table: order.table_number || 'Не указан',
            waiter: order.waiter_name || 'Не указан',
            rating: order.rating || null,
            comment: order.comment || null,
            status: order.status,
            order_type: order.order_type,
        }));
    };
    const calculateStats = (orders: any[]) => {
        const validOrders = orders.filter(order => order.status === 'closed');
        const totalSpent = validOrders.reduce((sum: number, order: any) => sum + order.amount, 0);
        const totalVisits = validOrders.length;
        const avgCheck = totalVisits > 0 ? Math.round(totalSpent / totalVisits) : 0;

        return {
            totalVisits,
            totalSpent,
            avgCheck,
            frequency: 2.5,
            rfmScore: 455
        };
    };

    const handleFieldChange = (field: string, value: any) => {
        setCurrentGuest(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return {transformOrderData,calculateStats,handleFieldChange};
}