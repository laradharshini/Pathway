/**
 * Authentication utility functions
 */

class Auth {
    static getToken() {
        return localStorage.getItem('token');
    }

    static getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    static requireRole(role) {
        const user = this.getUser();
        if (!user || user.role !== role) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

/**
 * Fetch with authentication
 */
async function fetchWithAuth(url, options = {}) {
    const token = Auth.getToken();

    const headers = {
        ...options.headers
    };

    // Set default Content-Type to JSON unless sending FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized
    if (response.status === 401) {
        Auth.logout();
        throw new Error('Session expired. Please login again.');
    }

    return response;
}

// Make Auth and fetchWithAuth available globally
window.Auth = Auth;
window.fetchWithAuth = fetchWithAuth;
