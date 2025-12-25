// hooks/useNotifications.js - ИСПРАВЛЕННЫЙ
import { useState, useCallback, useEffect, useRef } from 'react';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [toastNotifications, setToastNotifications] = useState([]);
    const processedIdsRef = useRef(new Set()); // Для отслеживания ID

    // Функция удаления старых уведомлений
    const cleanupOldNotifications = useCallback(() => {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 минут

        setNotifications(prev => {
            const filtered = prev.filter(notification => {
                const notificationTime = new Date(notification.timestamp).getTime();
                const isOld = now - notificationTime > maxAge;
                // Удаляем из processedIds если уведомление старое
                if (isOld && (notification.guestId || notification.orderId)) {
                    processedIdsRef.current.delete(notification.guestId || notification.orderId);
                }
                return !isOld;
            });
            return filtered.slice(0, 50); // Всегда ограничиваем
        });

        setToastNotifications(prev =>
            prev.filter(notification => {
                const notificationTime = new Date(notification.timestamp).getTime();
                return now - notificationTime < 5000; // 5 секунд для toast
            })
        );
    }, []);

    // Автоматическая очистка
    useEffect(() => {
        const interval = setInterval(cleanupOldNotifications, 30000); // Каждые 30 секунд
        return () => clearInterval(interval);
    }, [cleanupOldNotifications]);

    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        console.log('🔔 Adding notification:', {
            type: newNotification.type,
            guestId: newNotification.guestId,
            orderId: newNotification.orderId
        });

        // Проверяем дубликаты по ID (гостя или заказа)
        const uniqueId = newNotification.guestId || newNotification.orderId;
        if (uniqueId && processedIdsRef.current.has(uniqueId)) {
            console.log('⚠️ Notification already exists for:', uniqueId);
            return;
        }

        if (uniqueId) {
            processedIdsRef.current.add(uniqueId);
        }

        // Добавляем в основной список
        setNotifications(prev => {
            const newList = [newNotification, ...prev];
            return newList.slice(0, 50);
        });

        // Добавляем в toast уведомления
        setToastNotifications(prev => {
            const newList = [...prev, newNotification];
            return newList.slice(0, 5);
        });

        // Автоматически удаляем toast через 6 секунд
        setTimeout(() => {
            setToastNotifications(current =>
                current.filter(n => n.id !== newNotification.id)
            );
        }, 6000);

        // Браузерные уведомления
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(newNotification.title, {
                    body: newNotification.message,
                    icon: '/favicon.ico',
                    tag: `notif_${newNotification.id}`
                });
            } catch (error) {
                console.error('Error creating browser notification:', error);
            }
        }

    }, []); // Убрали зависимость от notifications

    const removeToast = useCallback((id) => {
        setToastNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const markAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setToastNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        setToastNotifications([]);
        processedIdsRef.current.clear();
    }, []);

    // Запрашиваем разрешение на уведомления
    useEffect(() => {
        const requestNotificationPermission = async () => {
            if ('Notification' in window && Notification.permission === 'default') {
                try {
                    await Notification.requestPermission();
                } catch (error) {
                    console.error('Error requesting notification permission:', error);
                }
            }
        };
        requestNotificationPermission();
    }, []);

    return {
        notifications,
        toastNotifications,
        addNotification,
        removeToast,
        markAsRead,
        removeNotification,
        clearAll,
        getStats: () => ({
            total: notifications.length,
            toast: toastNotifications.length,
            processedIds: processedIdsRef.current.size
        })
    };
};