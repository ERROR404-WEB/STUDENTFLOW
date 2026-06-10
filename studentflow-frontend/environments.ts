const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const environment = {
    production: false,
    baseUrl: isLocal ? 'http://localhost:3000' : 'https://studentflow-api.onrender.com'
};
