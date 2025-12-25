// auth.js

export const loginUser = async (username, password) => {
    try {
        const response = await fetch('/Auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        });

        const data = await response.json();
        console.log('Response:', data);

        if (!response.ok) {
            throw new Error(`Login failed: ${JSON.stringify(data)}`);
        }

        const token = data.access_token || data.token || data.accessToken;

        if (token) {

            localStorage.setItem('token', token);
            localStorage.setItem('token_timestamp', Date.now().toString());
            console.log('Token received and saved');
            return token;
        } else {
            console.log('Full response:', data);
            throw new Error('Token not found in response');
        }

    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const isTokenExpired = () => {
    const tokenTimestamp = localStorage.getItem('token_timestamp');
    if (!tokenTimestamp) return true;

    const currentTime = Date.now();
    const tokenAge = currentTime - parseInt(tokenTimestamp, 10);
    const THIRTY_MINUTES = 30 * 60 * 1000;

    return tokenAge > THIRTY_MINUTES;
};

export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    if (isTokenExpired()) {
        console.log('Token has expired');
        removeToken();
        return false;
    }

    return true;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_timestamp');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedSalesPoint');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('currentUser');
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('token_timestamp', Date.now().toString());
};

export const removeToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_timestamp');
};