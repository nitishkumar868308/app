"use client";

import { GuestRoute } from "@/components/Include/AuthGuard";
import Background from "@/components/Include/Background";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <GuestRoute>
            <div className="relative min-h-screen w-full bg-[#000000] overflow-x-hidden">
                <Background />
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </GuestRoute>
    );
};

export default AuthLayout;
