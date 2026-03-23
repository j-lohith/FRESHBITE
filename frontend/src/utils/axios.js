import axios from 'axios';
import { getToken } from './auth';
import { loadingManager } from './loadingManager';

const normalizeApiUrl = (value) => {
if (!value) return '';
return value.trim().replace(/\/+$/, '');
};

// 🔥 Get backend URL from env
const rawApiUrl = normalizeApiUrl(process.env.REACT_APP_API_URL);

// 🚨 IMPORTANT: No fallback to '/api' in production
if (!rawApiUrl) {
console.error("❌ REACT_APP_API_URL is NOT defined!");
}
console.log(rawApiUrl)

// ✅ Always construct proper backend API URL
const apiBaseUrl = rawApiUrl
? rawApiUrl.endsWith('/api')
? rawApiUrl
: `${rawApiUrl}/api`
: ''; // no fallback

console.log("🌐 API BASE URL:", apiBaseUrl); // 🔥 DEBUG

const api = axios.create({
baseURL: apiBaseUrl,
});

// 🔐 Attach token
api.interceptors.request.use(
(config) => {
const token = getToken();
if (token) {
config.headers.Authorization = `Bearer ${token}`;
}
loadingManager.start();
return config;
},
(error) => {
loadingManager.stop();
return Promise.reject(error);
}
);

// 📥 Response handler
api.interceptors.response.use(
(response) => {
loadingManager.stop();
return response;
},
(error) => {
loadingManager.stop();


console.error("❌ API ERROR:", error.response || error.message);

return Promise.reject(error);


}
);

export default api;
