'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, TrendingUp, Clock, Layers, Database } from 'lucide-react';
import { SimulationStats } from '@/types';

interface MetricsPanelProps {
    stats: SimulationStats;
}

type MetricColor = 'primary' | 'secondary' | 'success' | 'danger';

const COLOR_CLASSES: Record<MetricColor, string> = {
    primary: 'from-primary-500/20 to-primary-600/20 border-primary-500/30',
    secondary: 'from-secondary-500/20 to-secondary-600/20 border-secondary-500/30',
    success: 'from-success-500/20 to-success-600/20 border-success-500/30',
    danger: 'from-danger-500/20 to-danger-600/20 border-danger-500/30',
};

const ICON_COLORS: Record<MetricColor, string> = {
    primary: 'text-primary-400',
    secondary: 'text-secondary-400',
    success: 'text-success-400',
    danger: 'text-danger-400',
};

export default function MetricsPanel({ stats }: MetricsPanelProps) {
    if (!stats || !stats.caches) return null;

    const overallHitRate =
        stats.caches.length > 0
            ? (
                stats.caches.reduce((sum, cache) => sum + cache.hit_rate, 0) /
                stats.caches.length
            ).toFixed(2)
            : '0.00';

    const totalEvictions = stats.caches.reduce((sum, cache) => sum + cache.evictions, 0);
    const totalWritebacks = stats.caches.reduce((sum, cache) => sum + cache.writebacks, 0);

    const metrics: {
        icon: React.ElementType;
        label: string;
        value: string;
        color: MetricColor;
        trend?: string | null;
        description?: string;
    }[] = [
            {
                icon: Activity,
                label: 'Instructions',
                value: stats.instruction_count.toLocaleString(),
                color: 'primary',
                trend: null,
            },
            {
                icon: Clock,
                label: 'Total Cycles',
                value: stats.total_cycles.toLocaleString(),
                color: 'secondary',
                trend: null,
            },
            {
                icon: Target,
                label: 'CPI',
                value: stats.cpi.toString(),
                color: 'success',
                description: 'Cycles Per Instruction',
            },
            {
                icon: TrendingUp,
                label: 'Speedup',
                value: `${stats.speedup}x`,
                color: 'success',
                description: 'vs. Memory Only',
            },
            {
                icon: Layers,
                label: 'Avg Hit Rate',
                value: `${overallHitRate}%`,
                color: 'primary',
                description: 'Across All Caches',
            },
            {
                icon: Database,
                label: 'Memory Accesses',
                value: stats.memory.total_accesses.toLocaleString(),
                color: 'danger',
                description: 'RAM Access Count',
            },
        ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6"
        >
            <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-primary-400" />
                <h2 className="text-xl font-bold text-gray-100">Performance Metrics</h2>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-gradient-to-br ${COLOR_CLASSES[metric.color]} rounded-lg p-4 border`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <Icon className={`w-5 h-5 ${ICON_COLORS[metric.color]}`} />
                                {metric.trend && (
                                    <span className="text-xs text-success-400">{metric.trend}</span>
                                )}
                            </div>
                            <div className="text-2xl font-bold text-gray-100 mb-1">
                                {metric.value}
                            </div>
                            <div className="text-xs text-gray-400">{metric.label}</div>
                            {metric.description && (
                                <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Cache Details Table */}
            <div className="bg-gray-800/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Cache Level Details</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-2 px-3 text-gray-400 font-semibold">Level</th>
                                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Size</th>
                                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Hits</th>
                                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Misses</th>
                                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Hit Rate</th>
                                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Evictions</th>
                                <th className="text-right py-2 px-3 text-gray-400 font-semibold">Writebacks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.caches.map((cache, index) => (
                                <motion.tr
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border-b border-gray-800 hover:bg-gray-800/30"
                                >
                                    <td className="py-3 px-3 text-gray-200 font-semibold">{cache.name}</td>
                                    <td className="py-3 px-3 text-right text-gray-300">
                                        {cache.size_kb} KB
                                    </td>
                                    <td className="py-3 px-3 text-right text-success-400 font-mono">
                                        {cache.hits.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-3 text-right text-danger-400 font-mono">
                                        {cache.misses.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono">
                                        <span
                                            className={`${cache.hit_rate >= 80
                                                ? 'text-success-400'
                                                : cache.hit_rate >= 50
                                                    ? 'text-yellow-400'
                                                    : 'text-danger-400'
                                                }`}
                                        >
                                            {cache.hit_rate}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-right text-gray-300 font-mono">
                                        {cache.evictions.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-3 text-right text-gray-300 font-mono">
                                        {cache.writebacks.toLocaleString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Total Evictions</div>
                    <div className="text-xl font-bold text-orange-400">
                        {totalEvictions.toLocaleString()}
                    </div>
                </div>
                <div className="bg-gray-800/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Total Writebacks</div>
                    <div className="text-xl font-bold text-pink-400">
                        {totalWritebacks.toLocaleString()}
                    </div>
                </div>
                <div className="bg-gray-800/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Avg Access Time</div>
                    <div className="text-xl font-bold text-blue-400">
                        {stats.avg_access_time_ns} ns
                    </div>
                </div>
                <div className="bg-gray-800/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Wait Cycles</div>
                    <div className="text-xl font-bold text-purple-400">
                        {stats.wait_cycles.toLocaleString()}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
