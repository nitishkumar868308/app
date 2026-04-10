import Cookies from "js-cookie";

// ─── Cookie config ────────────────────────────────────────────────────────────

const TOKEN_KEY = "auth_token";
const VERIFY_KEY = "verify_token";
const USER_KEY = "user_data";

// 7 days expiry for auth token cookie
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 7,
    path: "/",
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
};

// ─── Auth Token ───────────────────────────────────────────────────────────────

export const setAuthToken = (token: string) => {
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
};

export const getAuthToken = (): string | undefined => {
    return Cookies.get(TOKEN_KEY);
};

export const removeAuthToken = () => {
    Cookies.remove(TOKEN_KEY, { path: "/" });
};

// ─── Verify Token (temporary, for registration flow) ──────────────────────────

export const setVerifyToken = (token: string) => {
    Cookies.set(VERIFY_KEY, token, { ...COOKIE_OPTIONS, expires: 1 / 24 }); // 1 hour
};

export const getVerifyToken = (): string | undefined => {
    return Cookies.get(VERIFY_KEY);
};

export const removeVerifyToken = () => {
    Cookies.remove(VERIFY_KEY, { path: "/" });
};

// ─── User Data (stored in cookie as JSON — lightweight fields only) ───────────

export interface StoredUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_no: string;
    avatar: string | null;
    pin_status: boolean;
    role: number;
    referral_id: string | null;
    referred_by_name: string | null;
    is_investor: boolean;
    google2fa_enable: boolean;
}

export const setUserData = (user: StoredUser) => {
    Cookies.set(USER_KEY, JSON.stringify(user), COOKIE_OPTIONS);
};

export const getUserData = (): StoredUser | null => {
    const raw = Cookies.get(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as StoredUser;
    } catch {
        return null;
    }
};

export const removeUserData = () => {
    Cookies.remove(USER_KEY, { path: "/" });
};

// ─── Full logout (clears everything) ──────────────────────────────────────────

export const clearAuth = () => {
    removeAuthToken();
    removeVerifyToken();
    removeUserData();
};

// ─── Check if user is authenticated ──────────────────────────────────────────

export const isAuthenticated = (): boolean => {
    return !!getAuthToken();
};
