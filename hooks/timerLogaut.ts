import { useEffect, useRef } from "react";

export function useTimerLogaut (
    timeout: number = 30 * 60 * 1000,
    onIdle?: () => void,
    enabled: boolean = true
) {
    const timerRef = useRef<NodeJS.Timeout>();
    const enabledRef = useRef(enabled);
    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);

    const resetTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Проверяем через ref для актуального значения
        if (onIdle && enabledRef.current) {
            timerRef.current = setTimeout(onIdle, timeout);
        }
    };

    const clearTimer = () => {
        if (timerRef.current) {

            clearTimeout(timerRef.current);
        }
    };

    useEffect(() => {
        if (!enabled) {
            clearTimer();
            return;
        }

        const events = [
            'mousedown', 'mousemove', 'click',
            'keydown', 'keypress', 'scroll',
            'touchstart', 'wheel'
        ];

        const handleEvent = () => {
            resetTimer();
        };

        events.forEach(event => {
            document.addEventListener(event, handleEvent, { passive: true });
        });

        resetTimer();

        return () => {
            clearTimer();
            events.forEach(event => {
                document.removeEventListener(event, handleEvent);
            });
        };
    }, [timeout, onIdle, enabled]);

    return { reset: resetTimer, clear: clearTimer };
}