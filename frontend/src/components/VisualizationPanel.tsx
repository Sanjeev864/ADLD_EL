'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { SimulationStats } from '@/types';

interface VisualizationPanelProps {
    stats: SimulationStats;
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function VisualizationPanel({ stats }: VisualizationPanelProps) {
    // Prepare cache comparison data
    const cacheComparisonData = stats.caches.map((cache) => ({
        name: cache.name,
        'Hit Rate': cache.hit_rate,
        'Miss Rate': cache.miss_rate,
        Hits: cache.hits,
        Misses: cache.misses,
    }));

    // Prepare access time data
    const accessTimeData = stats.caches.map((cache) => ({
        name: cache.name,
        'Access Time (ns)': cache.access_time_ns,
    }));

    // Add memory
    accessTimeData.push({
        name: 'Memory',
        'Access Time (ns)': stats.memory.access_time_ns,
    });

    // Prepare pie chart data for hits/misses
    const totalHits = stats.caches.reduce((sum, cache) => sum + cache.hits, 0);
    const totalMisses = stats.caches.reduce((sum, cache) => sum + cache.misses, 0);

    const hitMissData = [
        { name: 'Hits', value: totalHits },
        { name: 'Misses', value: totalMisses },
    ];

    // Prepare eviction data
    const evictionData = stats.caches.map((cache) => ({
        name: cache.name,
        Evictions: cache.evictions,
        Writebacks: cache.writebacks,
    }));

    // Prepare execution timeline (if available)
    const timelineData = stats.execution_log.map((log) => ({
        instruction: log.instruction,
        'Cumulative Cycles': log.cumulative_cycles,
        'Access Time': log.access_time_ns,
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6"
        >
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-secondary-400" />
                <h2 className="text-xl font-bold text-gray-100">Performance Visualization</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hit/Miss Rate Comparison */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">
                        Cache Hit/Miss Rates
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={cacheComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                }}
                                labelStyle={{ color: '#f3f4f6' }}
                            />
                            <Legend />
                            <Bar dataKey="Hit Rate" fill="#22c55e" />
                            <Bar dataKey="Miss Rate" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Overall Hit/Miss Distribution */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">
                        Overall Hit/Miss Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={hitMissData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {hitMissData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#ef4444'} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Access Time Comparison */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">
                        Access Time Hierarchy
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={accessTimeData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9ca3af" />
                            <YAxis dataKey="name" type="category" stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                }}
                                labelStyle={{ color: '#f3f4f6' }}
                            />
                            <Bar dataKey="Access Time (ns)" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Evictions and Writebacks */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">
                        Evictions & Writebacks
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={evictionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                }}
                                labelStyle={{ color: '#f3f4f6' }}
                            />
                            <Legend />
                            <Bar dataKey="Evictions" fill="#f59e0b" />
                            <Bar dataKey="Writebacks" fill="#ec4899" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Execution Timeline */}
                {timelineData.length > 0 && (
                    <div className="bg-gray-800/30 rounded-lg p-4 lg:col-span-2">
                        <h3 className="text-sm font-semibold text-gray-300 mb-4">
                            Execution Timeline (Sample)
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="instruction" stroke="#9ca3af" label={{ value: 'Instruction #', position: 'insideBottom', offset: -5 }} />
                                <YAxis stroke="#9ca3af" label={{ value: 'Cumulative Cycles', angle: -90, position: 'insideLeft' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: '#f3f4f6' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="Cumulative Cycles" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </motion.div>
    );
}