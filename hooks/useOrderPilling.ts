
import { useEffect, useRef, useCallback } from 'react';

export const useOrderPolling = (onNewOrder, isAuthenticated) => {
    const intervalRef = useRef(null);
    const processedOrderIdsRef = useRef(new Set());
    const lastOrderIdRef = useRef(0);
    const retryCountRef = useRef(0);

    const memoizedOnNewOrder = useCallback(onNewOrder, [onNewOrder]);

    useEffect(() => {
        if (!isAuthenticated || !memoizedOnNewOrder) {

            return;
        }

        console.log('🚀 Starting order polling...');
        processedOrderIdsRef.current.clear();
        lastOrderIdRef.current = 0;
        retryCountRef.current = 0;

        const initializeOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    return false;
                }

                console.log('📋 Initializing orders...');
                const response = await fetch(
                    '/orders/?skip=0&limit=20&order=id_desc',
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    }
                );

                if (response.ok) {
                    const orders = await response.json();
                    if (orders.length > 0) {
                        lastOrderIdRef.current = orders[0].id;
                        orders.forEach(order => {
                            processedOrderIdsRef.current.add(order.id);
                        });
                        console.log(' Initialized  last  ID:', lastOrderIdRef.current);
                    }
                    return true;
                }
                return false;
            } catch (error) {
                console.error(' Error initializing :', error);
                return false;
            }
        };

        const checkForNewOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('❌ No token for check');
                    return;
                }

                let url = `/orders/?skip=0&limit=10&order=id_desc`;
                if (lastOrderIdRef.current > 0) {
                    url += `&min_id=${lastOrderIdRef.current}`;
                }
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const orders = await response.json();

                    const newOrders = orders.filter(order =>
                        order.id > lastOrderIdRef.current &&
                        !processedOrderIdsRef.current.has(order.id)
                    );

                    if (newOrders.length > 0) {

                        const maxId = Math.max(...newOrders.map(o => o.id));
                        lastOrderIdRef.current = maxId;

                        newOrders
                            .sort((a, b) => a.id - b.id)
                            .forEach(order => {
                                processedOrderIdsRef.current.add(order.id);
                                memoizedOnNewOrder(order);
                            });

                        retryCountRef.current = 0;
                    }
                } else if (response.status === 400) {

                    const altResponse = await fetch(
                        '/orders/?skip=0&limit=50&order=id_desc',
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json'
                            }
                        }
                    );

                    if (altResponse.ok) {
                        const allOrders = await altResponse.json();
                        const altNewOrders = allOrders.filter(order =>
                            !processedOrderIdsRef.current.has(order.id)
                        );

                        if (altNewOrders.length > 0) {
                            const maxId = Math.max(...altNewOrders.map(o => o.id));
                            lastOrderIdRef.current = maxId;

                            altNewOrders.forEach(order => {
                                processedOrderIdsRef.current.add(order.id);
                                memoizedOnNewOrder(order);
                            });
                        }
                    }
                } else {
                    console.error('❌ Server error:', response.status);
                    retryCountRef.current++;
                }

            } catch (error) {
                console.error('❌ Order polling error:', error);
                retryCountRef.current++;
            }
        };

        // Инициализация и запуск
        initializeOrders().then(() => {

            setTimeout(checkForNewOrders, 2000);


            intervalRef.current = setInterval(checkForNewOrders, 20000);
        });

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAuthenticated, memoizedOnNewOrder]);

    const checkOrdersManually = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(
                '/orders/?skip=0&limit=1&order=id_desc',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const orders = await response.json();
                if (orders.length > 0) {
                    const latestOrder = orders[0];
                    if (latestOrder.id > lastOrderIdRef.current) {
                        lastOrderIdRef.current = latestOrder.id;
                        processedOrderIdsRef.current.add(latestOrder.id);
                        memoizedOnNewOrder(latestOrder);
                    }
                }
            }
        } catch (error) {
            console.error('', error);
        }
    }, [memoizedOnNewOrder]);

    return { checkOrdersManually };
};