import { useState, useEffect } from 'react';

export const useOrders = (guestId) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrders = async (guestId = null) => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            let url = '/orders/?skip=0&limit=1000';

            const response = await fetch(url,{
                    headers:{
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    }
            });
            if (!response.ok) throw new Error('Ошибка загрузки заказов');

            const data = await response.json();


            let filteredOrders = data;
            if (guestId) {
                filteredOrders = data.filter(order =>
                    order.guest_id === guestId || order.guest_id === parseInt(guestId)
                );
            }

            setOrders(filteredOrders);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(guestId);
    }, [guestId]);

    return { orders, loading, error, refetch: fetchOrders };
};