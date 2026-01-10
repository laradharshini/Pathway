const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getApiUrl = (path) => {
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // If it's already an absolute URL (e.g. starts with http), return as-is
    if (cleanPath.startsWith('http')) return cleanPath;

    return `${API_BASE_URL}${cleanPath}`;
};

export default getApiUrl;
