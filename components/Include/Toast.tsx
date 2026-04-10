"use client";

import { Toaster } from "react-hot-toast";

const ToastProvider = () => (
    <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
            duration: 4000,
            style: {
                background: "#0d1f12",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "16px",
                padding: "12px 16px",
                fontSize: "12px",
                fontWeight: 700,
                maxWidth: "400px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            },
            success: {
                iconTheme: {
                    primary: "#10b981",
                    secondary: "#000",
                },
                style: {
                    border: "1px solid rgba(16,185,129,0.2)",
                    background: "linear-gradient(135deg, #0d1f12 0%, #050d07 100%)",
                },
            },
            error: {
                iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                },
                style: {
                    border: "1px solid rgba(239,68,68,0.2)",
                    background: "linear-gradient(135deg, #1f0d0d 0%, #0d0507 100%)",
                },
            },
        }}
    />
);

export default ToastProvider;
