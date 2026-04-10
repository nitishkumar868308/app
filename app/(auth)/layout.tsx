"use client";

import { GuestRoute } from "@/components/Include/AuthGuard";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <GuestRoute>
            <div className="w-full">
                {children}
            </div>
        </GuestRoute>
    );
};

export default AuthLayout;
