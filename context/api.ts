// api.js
import { getToken, isTokenExpired, removeToken } from './auth';

export const authFetch = async (url, options = {}) => {
    // Проверяем, не истек ли токен
    if (isTokenExpired()) {
        console.log('Token expired in authFetch');
        // Только помечаем как неавторизованный, НЕ делаем редирект
        throw new Error('Token expired');
    }

    const token = getToken();

    if (!token) {
        throw new Error('No token found');
    }

    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Если получили 401 Unauthorized, токен недействителен
    if (response.status === 401) {
        console.log('Unauthorized, token invalid');
        removeToken();
        throw new Error('Unauthorized');
    }

    return response.json();
};