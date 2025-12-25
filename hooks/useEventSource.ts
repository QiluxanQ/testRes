// hooks/useNotificationsPolling.js
import { useEffect, useRef, useCallback } from 'react';

export const useNotificationsPolling = (onNewGuest, onNewOrder, isActive = true) => {
    const pollingIntervalRef = useRef(null);
    const lastGuestIdRef = useRef(0);
    const lastOrderIdRef = useRef(0);
    const isMountedRef = useRef(true);
    const retryCountRef = useRef(0);
    const maxRetries = 3;
    const backoffDelayRef = useRef(30000); // Начальная задержка 30 сек

    // Функция экспоненциальной задержки для retry
    const getBackoffDelay = (attempt) => {
        const baseDelay = 30000; // 30 секунд
        const maxDelay = 300000; // 5 минут
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        console.log(`Backoff delay: ${delay}ms (attempt ${attempt})`);
        return delay;
    };

    // Инициализация последних ID
    const initializeLastIds = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token for initialization');
                return false;
            }

            // Параллельно загружаем гостей и заказы
            const [guestsResponse, ordersResponse] = await Promise.all([
                fetch(`/guests/?skip=0&limit=1&order=id_desc`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }),
                fetch(`/orders/?skip=0&limit=1&order=id_desc`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                })
            ]);

            if (guestsResponse.ok) {
                const guests = await guestsResponse.json();
                if (guests.length > 0) {
                    lastGuestIdRef.current = guests[0].id;
                    console.log('Initial last guest ID:', lastGuestIdRef.current);
                }
            }

            if (ordersResponse.ok) {
                const orders = await ordersResponse.json();
                if (orders.length > 0) {
                    lastOrderIdRef.current = orders[0].id;
                    console.log('Initial last order ID:', lastOrderIdRef.current);
                }
            }

            retryCountRef.current = 0;
            backoffDelayRef.current = 30000;
            return true;

        } catch (error) {
            console.error('Error initializing last IDs:', error);
            return false;
        }
    }, []);

    // Оптимизированная проверка обновлений
    const checkForUpdates = useCallback(async () => {
        if (!isMountedRef.current) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token, skipping polling');
                return;
            }

            // Используем AbortController для timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 сек timeout

            try {
                // Параллельно проверяем гостей и заказы
                const [guestsResponse, ordersResponse] = await Promise.all([
                    fetch(`/guests/?skip=0&limit=10&order=id_desc`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        },
                        signal: controller.signal
                    }),
                    fetch(`/orders/?skip=0&limit=10&order=id_desc`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        },
                        signal: controller.signal
                    })
                ]);

                clearTimeout(timeoutId);

                // Обработка гостей
                if (guestsResponse.ok) {
                    const guests = await guestsResponse.json();
                    if (guests.length > 0) {
                        // Находим новых гостей (с ID больше последнего)
                        const newGuests = guests.filter(guest =>
                            guest.id > lastGuestIdRef.current
                        );

                        if (newGuests.length > 0) {
                            // Обновляем последний ID (берем максимальный)
                            const maxGuestId = Math.max(...newGuests.map(g => g.id));
                            lastGuestIdRef.current = maxGuestId;

                            console.log(`New guests found: ${newGuests.length}, latest ID: ${maxGuestId}`);

                            // Сортируем от старых к новым и вызываем callback
                            newGuests
                                .sort((a, b) => a.id - b.id)
                                .forEach(guest => {
                                    if (onNewGuest && isMountedRef.current) {
                                        onNewGuest(guest);
                                    }
                                });
                        }

                        retryCountRef.current = 0; // Сбрасываем счетчик ошибок
                    }
                } else if (guestsResponse.status === 401) {
                    console.error('Unauthorized - token might be invalid');
                    stopPolling();
                    return;
                }

                // Обработка заказов (аналогично гостям)
                if (ordersResponse.ok && onNewOrder) {
                    const orders = await ordersResponse.json();
                    if (orders.length > 0) {
                        const newOrders = orders.filter(order =>
                            order.id > lastOrderIdRef.current
                        );

                        if (newOrders.length > 0) {
                            const maxOrderId = Math.max(...newOrders.map(o => o.id));
                            lastOrderIdRef.current = maxOrderId;

                            console.log(`New orders found: ${newOrders.length}, latest ID: ${maxOrderId}`);

                            newOrders
                                .sort((a, b) => a.id - b.id)
                                .forEach(order => {
                                    if (onNewOrder && isMountedRef.current) {
                                        onNewOrder(order);
                                    }
                                });
                        }
                    }
                }

                // Успешная проверка - сбрасываем backoff
                if (backoffDelayRef.current > 30000) {
                    console.log('Resetting backoff to normal interval');
                    backoffDelayRef.current = 30000;

                    // Перезапускаем интервал с нормальной задержкой
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = setInterval(checkForUpdates, 30000);
                    }
                }

            } catch (fetchError) {
                if (fetchError.name === 'AbortError') {
                    console.log('Fetch timeout, continuing...');
                } else {
                    throw fetchError;
                }
            } finally {
                controller.abort(); // Гарантируем отмену
            }

        } catch (error) {
            console.error('Polling error:', error);

            // Увеличиваем счетчик ошибок
            retryCountRef.current++;

            if (retryCountRef.current >= maxRetries) {
                console.log('Max retries reached, using exponential backoff');

                // Экспоненциальная задержка
                backoffDelayRef.current = getBackoffDelay(retryCountRef.current - maxRetries);

                // Перезапускаем с увеличенной задержкой
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = setInterval(checkForUpdates, backoffDelayRef.current);
                }
            }
        }
    }, [onNewGuest, onNewOrder]);

    // Запуск polling
    const startPolling = useCallback((initialInterval = 30000) => {
        if (!isMountedRef.current || !isActive) return;

        console.log('Starting optimized polling...');

        // Инициализация и запуск
        initializeLastIds().then(success => {
            if (success && isMountedRef.current) {
                // Первая проверка через 1 секунду после инициализации
                setTimeout(() => {
                    if (isMountedRef.current) {
                        checkForUpdates();
                    }
                }, 1000);

                // Устанавливаем интервал
                pollingIntervalRef.current = setInterval(
                    checkForUpdates,
                    backoffDelayRef.current
                );
            }
        });

    }, [initializeLastIds, checkForUpdates, isActive]);

    // Остановка polling
    const stopPolling = useCallback(() => {
        console.log('Stopping polling');
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        retryCountRef.current = 0;
        backoffDelayRef.current = 30000;
    }, []);

    // Сброс состояния
    const resetLastCheck = useCallback(async () => {
        console.log('Resetting last check...');
        await initializeLastIds();
    }, [initializeLastIds]);

    // Ручная проверка (для тестирования)
    const manualCheck = useCallback(() => {
        console.log('Manual check triggered');
        checkForUpdates();
    }, [checkForUpdates]);

    // Автоматический старт/стоп при изменении isActive
    useEffect(() => {
        isMountedRef.current = true;

        if (isActive) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => {
            console.log('Cleaning up polling');
            isMountedRef.current = false;
            stopPolling();
        };
    }, [isActive, startPolling, stopPolling]);

    // Дебаг информация
    useEffect(() => {
        const logInterval = setInterval(() => {
            if (isMountedRef.current) {
                console.log('Polling status:', {
                    active: !!pollingIntervalRef.current,
                    lastGuestId: lastGuestIdRef.current,
                    lastOrderId: lastOrderIdRef.current,
                    retryCount: retryCountRef.current,
                    currentInterval: backoffDelayRef.current
                });
            }
        }, 60000); // Логируем каждую минуту

        return () => clearInterval(logInterval);
    }, []);

    return {
        startPolling,
        stopPolling,
        resetLastCheck,
        manualCheck,
        getStatus: () => ({
            isPolling: !!pollingIntervalRef.current,
            lastGuestId: lastGuestIdRef.current,
            lastOrderId: lastOrderIdRef.current,
            retryCount: retryCountRef.current,
            currentInterval: backoffDelayRef.current
        })
    };
};