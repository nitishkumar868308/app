"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import {
    getAuthToken,
    setAuthToken,
    setUserData,
    getUserData,
    removeUserData,
    clearAuth,
    setVerifyToken,
    getVerifyToken,
    removeVerifyToken,
    type StoredUser,
} from "@/lib/auth";

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextType {
    user: StoredUser | null;
    token: string | undefined;
    loading: boolean;

    /** Save token + user after login/register */
    login: (token: string, user: StoredUser) => void;

    /** Clear everything and redirect to login */
    logout: () => void;

    /** Re-fetch user data from API */
    refreshUser: () => Promise<void>;

    /** Verify token helpers (for registration flow) */
    saveVerifyToken: (token: string) => void;
    clearVerifyToken: () => void;
    verifyToken: string | undefined;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser]               = useState<StoredUser | null>(null);
    const [token, setToken]             = useState<string | undefined>(undefined);
    const [verifyTkn, setVerifyTkn]     = useState<string | undefined>(undefined);
    const [loading, setLoading]         = useState(true);

    // Hydrate from cookies on mount
    useEffect(() => {
        const savedToken = getAuthToken();
        const savedUser  = getUserData();
        const savedVerify = getVerifyToken();

        if (savedToken) setToken(savedToken);
        if (savedUser)  setUser(savedUser);
        if (savedVerify) setVerifyTkn(savedVerify);

        setLoading(false);
    }, []);

    // Login — save token + user to cookies + state
    const login = useCallback((newToken: string, newUser: StoredUser) => {
        setAuthToken(newToken);
        setUserData(newUser);
        setToken(newToken);
        setUser(newUser);

        // Clean up verify token from registration flow
        removeVerifyToken();
        setVerifyTkn(undefined);
    }, []);

    // Logout — clear everything
    const logout = useCallback(() => {
        // Fire-and-forget server logout
        api.get(ENDPOINTS.LOGOUT).catch(() => {});

        clearAuth();
        setToken(undefined);
        setUser(null);
        setVerifyTkn(undefined);

        window.location.href = "/login";
    }, []);

    // Refresh user data from API
    const refreshUser = useCallback(async () => {
        if (!getAuthToken()) return;

        try {
            const res = await api.get(ENDPOINTS.USER_DETAILS);
            const data = res.data?.data;
            if (data) {
                const userData: StoredUser = {
                    id:                data.id,
                    first_name:        data.first_name || "",
                    last_name:         data.last_name || "",
                    email:             data.email || "",
                    phone_no:          data.phone_no || "",
                    avatar:            data.avatar || null,
                    pin_status:        data.pin_status ?? data.pin_set ?? data.is_pin_set ?? false,
                    role:              data.role ?? 0,
                    referral_id:       data.referral_id || null,
                    referred_by_name:  data.referred_by_name || null,
                    is_investor:       data.is_investor ?? false,
                    google2fa_enable:  data.google2fa_enable ?? false,
                    google2fa_qr_code: data.google2fa_qr_code || null,
                };
                setUserData(userData);
                setUser(userData);
            }
        } catch {
            // Token might be expired
        }
    }, []);

    // Verify token helpers
    const saveVerifyToken = useCallback((vt: string) => {
        setVerifyToken(vt);
        setVerifyTkn(vt);
    }, []);

    const clearVerifyTokenFn = useCallback(() => {
        removeVerifyToken();
        setVerifyTkn(undefined);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                refreshUser,
                saveVerifyToken,
                clearVerifyToken: clearVerifyTokenFn,
                verifyToken: verifyTkn,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
