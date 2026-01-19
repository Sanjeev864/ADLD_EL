'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Download, Upload } from 'lucide-react';
import { SystemConfig, CacheConfig, WorkloadRequest, Preset } from '@/types';
import { getPresets } from '@/utils/api';

interface ConfigPanelProps {
    config: SystemConfig;
    setConfig: (config: SystemConfig) => void;
    workload: WorkloadRequest;
    setWorkload: (workload: WorkloadRequest) => void;
    onConfigure: () => void;
}

export default function ConfigPanel({
    config,
    setConfig,
    workload,
    setWorkload,
    onConfigure,
}: ConfigPanelProps) {
    const [presets, setPresets] = useState<Preset[]>([]);

    useEffect(() => {
        loadPresets();
    }, []);

    const loadPresets = async () => {
        try {
            const response = await getPresets();
            setPresets(response);
        } catch (error) {
            console.error('Failed to load presets:', error);
        }
    };

    const addCache = () => {
        const newCache: CacheConfig = {
            name: `L${config.caches.length + 1}`,
            size_kb: 256,
            line_size_bytes: 64,
            associativity: 8,
            access_time_ns: 10,
            policy: 'LRU',
        };
        setConfig({ ...config, caches: [...config.caches, newCache] });
    };

    const removeCache = (index: number) => {
        const newCaches = config.caches.filter((_, i) => i !== index);
        setConfig({ ...config, caches: newCaches });
    };

    const updateCache = (index: number, updates: Partial<CacheConfig>) => {
        const newCaches = [...config.caches];
        newCaches[index] = { ...newCaches[index], ...updates };
        setConfig({ ...config, caches: newCaches });
    };

    const loadPreset = (preset: Preset) => {
        setConfig(preset.config);
        onConfigure();
    };

    return (
        <div className="space-y-6">
            {/* Presets */}
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Quick Presets
                </label>
                <div className="grid grid-cols-1 gap-2">
                    {presets.map((preset, index) => (
                        <button
                            key={index}
                            onClick={() => loadPreset(preset)}
                            className="text-left p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700 hover:border-primary-500/50 transition-all group"
                        >
                            <div className="font-semibold text-gray-200 group-hover:text-primary-400 transition-colors">
                                {preset.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cache Configuration */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-300">
                        Cache Levels
                    </label>
                    <button
                        onClick={addCache}
                        className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
                    >
                        <Plus className="w-4 h-4" />
                        Add Cache
                    </button>
                </div>

                <div className="space-y-4">
                    {config.caches.map((cache, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-gray-800/30 rounded-lg border border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <input
                                    type="text"
                                    value={cache.name}
                                    onChange={(e) => updateCache(index, { name: e.target.value })}
                                    className="bg-gray-800 text-gray-200 px-3 py-1 rounded font-semibold text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
                                />
                                {config.caches.length > 1 && (
                                    <button
                                        onClick={() => removeCache(index)}
                                        className="text-danger-400 hover:text-danger-300"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Size (KB)</label>
                                    <input
                                        type="number"
                                        value={cache.size_kb}
                                        onChange={(e) =>
                                            updateCache(index, { size_kb: parseInt(e.target.value) })
                                        }
                                        className="w-full bg-gray-800 text-gray-200 px-3 py-2 rounded text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Line Size (B)</label>
                                    <input
                                        type="number"
                                        value={cache.line_size_bytes}
                                        onChange={(e) =>
                                            updateCache(index, { line_size_bytes: parseInt(e.target.value) })
                                        }
                                        className="w-full bg-gray-800 text-gray-200 px-3 py-2 rounded text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Associativity</label>
                                    <input
                                        type="number"
                                        value={cache.associativity}
                                        onChange={(e) =>
                                            updateCache(index, { associativity: parseInt(e.target.value) })
                                        }
                                        className="w-full bg-gray-800 text-gray-200 px-3 py-2 rounded text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Latency (ns)</label>
                                    <input
                                        type="number"
                                        value={cache.access_time_ns}
                                        onChange={(e) =>
                                            updateCache(index, { access_time_ns: parseInt(e.target.value) })
                                        }
                                        className="w-full bg-gray-800 text-gray-200 px-3 py-2 rounded text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-400 mb-1">
                                        Replacement Policy
                                    </label>
                                    <select
                                        value={cache.policy}
                                        onChange={(e) => updateCache(index, { policy: e.target.value })}
                                        className="w-full bg-gray-800 text-gray-200 px-3 py-2 rounded text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
                                    >
                                        <option value="LRU">LRU (Least Recently Used)</option>
                                        <option value="FIFO">FIFO (First In First Out)</option>
                                        <option value="LFU">LFU (Least Frequently Used)</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Memory Configuration */}
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Main Memory (RAM)
                </label>
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 space-y-3">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Size (KB)</label>
                        <input
                            type="number"
                            value={config.memory.size_kb}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    memory: { ...config.memory, size_kb: parseInt(e.target.value) },
                                })
                            }
                            className="w-full bg-gray-800 text-gray-200 px-3 py-2 rounded text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Access Time (ns)</label>
                        <input
                            type="number"
                            value={config.memory.access_time_ns}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    memory: { ...config.memory, access_time_ns: parseInt(e.target.value) },
                                })
                            }
                            className="w-full bg-gray-800 text-gray-200 px-3 py-2 rounded text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Workload Configuration */}
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Workload</label>
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 space-y-3">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Access Pattern</label>
                        <select
                            value={workload.pattern}
                            onChange={(e) => setWorkload({ ...workload, pattern: e.target.value })}
                            className="w-full bg-gray-800 text-gray-200 px-3 py-2 rounded text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
                        >
                            <option value="sequential">Sequential Access</option>
                            <option value="random">Random Access</option>
                            <option value="strided">Strided Access</option>
                            <option value="locality">Temporal Locality</option>
                            <option value="mixed">Mixed Pattern</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Number of Accesses</label>
                        <input
                            type="number"
                            value={workload.num_accesses}
                            onChange={(e) =>
                                setWorkload({ ...workload, num_accesses: parseInt(e.target.value) })
                            }
                            step="100"
                            min="100"
                            max="100000"
                            className="w-full bg-gray-800 text-gray-200 px-3 py-2 rounded text-sm border border-gray-700 focus:border-primary-500 focus:outline-none"
                        />
                        <div className="mt-1 text-xs text-gray-500">
                            {workload.num_accesses.toLocaleString()} memory operations
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
