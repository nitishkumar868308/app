"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type Range = "day" | "week" | "month";

const RANGE_LABELS: Record<Range, string> = { day: "1D", week: "1W", month: "1M" };

interface ChartPoint {
    label: string;
    value: number;
}

const MarketChart = () => {
    const [activeRange, setActiveRange] = useState<Range>("month");
    const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchChart = async () => {
            setLoading(true);
            try {
                const res = await api.get(ENDPOINTS.CHART_DATA, {
                    params: { range: activeRange },
                });
                console.log("res", res)
                const raw = res.data?.data ?? res.data;

                if (!cancelled && raw) {
                    const selectedRange =
                        activeRange === "day"
                            ? raw.day_range
                            : activeRange === "week"
                                ? raw.week_range
                                : raw.month_range;

                    if (Array.isArray(selectedRange)) {
                        const points: ChartPoint[] = selectedRange.map((item: any) => ({
                            label: item.time || "",
                            value: Number(item.value || 0),
                        }));

                        setChartPoints(points);
                    }
                }
            } catch {
                // silent — chart will show empty state
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchChart();
        return () => { cancelled = true; };
    }, [activeRange]);

    const labels = chartPoints.map((p) => p.label);
    const values = chartPoints.map((p) => p.value);

    const latestPrice = values.length > 0 ? values[values.length - 1] : 0;
    const firstPrice = values.length > 0 ? values[0] : 0;
    const priceChange = firstPrice > 0 ? ((latestPrice - firstPrice) / firstPrice) * 100 : 0;
    const isPositive = priceChange >= 0;

    const chartData = {
        labels,
        datasets: [
            {
                data: values,
                borderColor: isPositive ? "#10b981" : "#ef4444",
                backgroundColor: (context: any) => {
                    const ctx = context.chart?.ctx;
                    if (!ctx) return "transparent";
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    if (isPositive) {
                        gradient.addColorStop(0, "rgba(16,185,129,0.25)");
                        gradient.addColorStop(1, "rgba(16,185,129,0)");
                    } else {
                        gradient.addColorStop(0, "rgba(239,68,68,0.25)");
                        gradient.addColorStop(1, "rgba(239,68,68,0)");
                    }
                    return gradient;
                },
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: isPositive ? "#10b981" : "#ef4444",
            },
        ],
    };

    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" as const },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(13,31,18,0.95)",
                borderColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
                titleColor: "#9ca3af",
                bodyColor: "#fff",
                bodyFont: { weight: "bold" as const },
                padding: 10,
                cornerRadius: 10,
                callbacks: {
                    label: (ctx: any) => `₹${ctx.parsed.y?.toFixed(4)}`,
                },
            },
        },
        scales: {
            x: { display: false },
            y: { display: false },
        },
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl bg-[#0a1a0f]/60 border border-emerald-500/12 p-5 md:p-6 overflow-hidden"
        >
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-[12px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">
                        Market Analytics
                    </p>
                    <div className="flex items-end gap-2.5">
                        <span className="text-2xl font-black text-white">
                            {latestPrice > 0 ? `₹${latestPrice.toFixed(4)}` : "₹—"}
                        </span>
                        {/* {values.length > 1 && (
                            <span className={`flex items-center gap-1 text-sm font-bold mb-0.5 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                                {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                                {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
                            </span>
                        )} */}
                    </div>
                </div>

                {/* Range toggle */}
                <div className="flex items-center gap-1 bg-white/4 border border-white/8 rounded-xl p-0.5">
                    {(["day", "week", "month"] as Range[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setActiveRange(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeRange === r
                                    ? "bg-emerald-500 text-black shadow-sm"
                                    : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            {RANGE_LABELS[r]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart area */}
            <div className="h-36 md:h-48 w-full">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-emerald-500/50" />
                    </div>
                ) : values.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-sm text-gray-600">No chart data available</p>
                    </div>
                ) : (
                    <Line ref={chartRef} data={chartData} options={chartOptions} />
                )}
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-[12px] text-gray-600">YTP / INR</span>
                <span className="flex items-center gap-1.5 text-[12px] text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Market is live
                </span>
            </div>
        </motion.section>
    );
};

export default MarketChart;
