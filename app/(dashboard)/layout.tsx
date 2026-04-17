"use client";

import { ProtectedRoute } from "@/components/Include/AuthGuard";
import { WalletProvider } from "@/context/WalletContext";
import { StakingProvider } from "@/context/StakingContext";
import Background from "@/components/Include/Background";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute>
            <WalletProvider>
                <StakingProvider>
                    <div className="relative min-h-screen bg-[#030a05] overflow-x-hidden">
                        <Background />
                        <div className="relative z-10">
                            {children}
                        </div>
                    </div>
                </StakingProvider>
            </WalletProvider>
        </ProtectedRoute>
    );
};

export default DashboardLayout;
