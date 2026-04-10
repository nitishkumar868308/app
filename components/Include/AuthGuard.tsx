"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/Include/Loader";
import toast from "react-hot-toast";

// ─── ProtectedRoute — redirects to /login if NOT logged in ───────────────────

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, loading } = useAuth();
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!token) {
            toast.error("Please login to continue.");
            router.replace("/login");
        } else {
            setChecked(true);
        }
    }, [token, loading, router]);

    if (loading || !checked) return <PageLoader />;
    return <>{children}</>;
};

// ─── GuestRoute — redirects to /dashboard if ALREADY logged in ───────────────

export const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, loading } = useAuth();
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (token) {
            router.replace("/dashboard");
        } else {
            setChecked(true);
        }
    }, [token, loading, router]);

    if (loading || !checked) return <PageLoader />;
    return <>{children}</>;
};
