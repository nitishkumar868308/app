"use client";

import { ProtectedRoute } from "@/components/Include/AuthGuard";
import { WalletProvider } from "@/context/WalletContext";
import { StakingProvider } from "@/context/StakingContext";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute>
            <WalletProvider>
                <StakingProvider>
                    <div className="min-h-screen bg-[#030a05]">
                        {children}
                    </div>
                </StakingProvider>
            </WalletProvider>
        </ProtectedRoute>
    );
};

export default DashboardLayout;
