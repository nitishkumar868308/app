import axios from "axios";
import { getAuthToken, getVerifyToken, removeAuthToken } from "@/lib/auth";

// ─── Dynamic base URL based on NEXT_PUBLIC_API_ENV ────────────────────────────

const ENV = process.env.NEXT_PUBLIC_API_ENV || "local";

const BASE_URLS: Record<string, string> = {
    local:      process.env.NEXT_PUBLIC_API_URL_LOCAL      || "http://localhost:8000/api/v1",
    staging:    process.env.NEXT_PUBLIC_API_URL_STAGING     || "https://chiru-stage.yatripay.com/api/v1",
    production: process.env.NEXT_PUBLIC_API_URL_PRODUCTION  || "https://api.yatripay.com/api/v1",
};

export const API_BASE_URL = BASE_URLS[ENV] || BASE_URLS.local;

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Request interceptor (attach tokens from cookies) ─────────────────────────

api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }

        const verifyToken = getVerifyToken();
        if (verifyToken) {
            config.headers["X-VERIFY-TOKEN"] = verifyToken;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor (handle 401) ────────────────────────────────────────

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeAuthToken();
        }
        return Promise.reject(error);
    }
);

export default api;
