// hooks/useWebSocket.js - исправленный
import { useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url, onMessage) => {
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const onMessageRef = useRef(onMessage);

    // Обновляем ref при изменении onMessage
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const connect = useCallback(() => {
        try {
            // Закрываем существующее соединение
            if (wsRef.current) {
                wsRef.current.close();
            }

            const wsUrl = url.startsWith('http')
                ? url.replace('http', 'ws')
                : url.startsWith('https')
                    ? url.replace('https', 'wss')
                    : url;

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('WebSocket connected to', wsUrl);

                // Подписываемся на различные каналы
                const subscribeData = {
                    type: 'subscribe',
                    channels: ['guests', 'orders', 'reservations'] // Добавьте нужные каналы
                };
                ws.send(JSON.stringify(subscribeData));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (onMessageRef.current) {
                        onMessageRef.current(data);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);

                // Переподключаемся через 5 секунд
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }
                reconnectTimeoutRef.current = setTimeout(connect, 5000);
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('WebSocket connection failed:', error);
        }
    }, [url]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    useEffect(() => {
        // Подключаемся только если URL передан
        if (url) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [url, connect, disconnect]);

    const send = useCallback((message) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    return { send, disconnect };
};