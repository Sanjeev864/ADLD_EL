'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Layers, HardDrive, ArrowDown } from 'lucide-react';
import { SystemConfig, SimulationStats } from '@/types';

interface MemoryHierarchyProps {
    config: SystemConfig;
    stats: SimulationStats | null;
}

export default function MemoryHierarchy({ config, stats }: MemoryHierarchyProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6"
        >
            <div className="flex items-center gap-2 mb-6">
                <Layers className="w-5 h-5 text-primary-400" />
                <h2 className="text-xl font-bold text-gray-100">Memory Hierarchy</h2>
            </div>

            <div className="flex flex-col items-center gap-4">
                {/* CPU */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-full max-w-xs"
                >
                    <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 border-2 border-primary-500 rounded-lg p-4 glow-primary">
                        <div className="flex items-center justify-center gap-3">
                            <Cpu className="w-8 h-8 text-primary-400" />
                            <div>
                                <div className="text-lg font-bold text-gray-100">CPU Core</div>
                                <div className="text-xs text-gray-400">Processing Unit</div>
                            </div>
                        </div>
                        {stats && (
                            <div className="mt-3 pt-3 border-t border-primary-500/30 text-xs text-gray-300">
                                <div className="flex justify-between">
                                    <span>CPI:</span>
                                    <span className="font-mono">{stats.cpi}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Arrow */}
                <ArrowDown className="w-6 h-6 text-gray-600 animate-bounce" />

                {/* Cache Levels */}
                {config.caches.map((cache, index) => {
                    const cacheStats = stats?.caches.find((s) => s.name === cache.name);
                    const colors = [
                        { from: 'from-green-500/20', to: 'to-green-600/20', border: 'border-green-500', text: 'text-green-400' },
                        { from: 'from-blue-500/20', to: 'to-blue-600/20', border: 'border-blue-500', text: 'text-blue-400' },
                        { from: 'from-purple-500/20', to: 'to-purple-600/20', border: 'border-purple-500', text: 'text-purple-400' },
                    ];
                    const color = colors[index % colors.length];

                    return (
                        <div key={index} className="w-full max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className={`bg-gradient-to-br ${color.from} ${color.to} border-2 ${color.border} rounded-lg p-4`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 bg-gray-900/50 rounded ${color.text}`}>
                                            <Layers className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-gray-100">{cache.name} Cache</div>
                                            <div className="text-xs text-gray-400">
                                                {cache.size_kb} KB • {cache.associativity}-way • {cache.policy}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-mono ${color.text}`}>
                                            {cache.access_time_ns} ns
                                        </div>
                                        <div className="text-xs text-gray-500">latency</div>
                                    </div>
                                </div>

                                {cacheStats && (
                                    <div className="mt-4 grid grid-cols-4 gap-3">
                                        <div className="bg-gray-900/30 rounded p-2">
                                            <div className="text-xs text-gray-400">Hit Rate</div>
                                            <div className={`text-sm font-mono font-bold ${cacheStats.hit_rate >= 80 ? 'text-success-400' :
                                                cacheStats.hit_rate >= 50 ? 'text-yellow-400' : 'text-danger-400'
                                                }`}>
                                                {cacheStats.hit_rate}%
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/30 rounded p-2">
                                            <div className="text-xs text-gray-400">Hits</div>
                                            <div className="text-sm font-mono text-success-400">
                                                {cacheStats.hits.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/30 rounded p-2">
                                            <div className="text-xs text-gray-400">Misses</div>
                                            <div className="text-sm font-mono text-danger-400">
                                                {cacheStats.misses.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/30 rounded p-2">
                                            <div className="text-xs text-gray-400">Evictions</div>
                                            <div className="text-sm font-mono text-orange-400">
                                                {cacheStats.evictions.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {index < config.caches.length - 1 && (
                                <div className="flex justify-center my-2">
                                    <ArrowDown className="w-6 h-6 text-gray-600 animate-bounce" />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Arrow to Memory */}
                <ArrowDown className="w-6 h-6 text-gray-600 animate-bounce" />

                {/* Main Memory */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: config.caches.length * 0.2 }}
                    className="w-full max-w-2xl"
                >
                    <div className="bg-gradient-to-br from-danger-500/20 to-danger-600/20 border-2 border-danger-500 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-900/50 rounded text-danger-400">
                                    <HardDrive className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-100">Main Memory (RAM)</div>
                                    <div className="text-xs text-gray-400">{config.memory.size_kb} KB</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-mono text-danger-400">
                                    {config.memory.access_time_ns} ns
                                </div>
                                <div className="text-xs text-gray-500">latency</div>
                            </div>
                        </div>

                        {stats && (
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="bg-gray-900/30 rounded p-2">
                                    <div className="text-xs text-gray-400">Total Accesses</div>
                                    <div className="text-sm font-mono text-danger-400">
                                        {stats.memory.total_accesses.toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-gray-900/30 rounded p-2">
                                    <div className="text-xs text-gray-400">Blocks Used</div>
                                    <div className="text-sm font-mono text-danger-400">
                                        {stats.memory.blocks_used.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}