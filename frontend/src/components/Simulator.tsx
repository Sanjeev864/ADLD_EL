'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Settings, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import ConfigPanel from './ConfigPanel';
import VisualizationPanel from './VisualizationPanel';
import MetricsPanel from './MetricsPanel';
import MemoryHierarchy from './MemoryHierarchy';
import ExecutionLog from './ExecutionLog';
import { SystemConfig, SimulationStats, WorkloadRequest } from '@/types';
import { configureSystem, runSimulation, resetSystem } from '@/utils/api';

export default function Simulator() {
    const [config, setConfig] = useState<SystemConfig>({
        caches: [
            {
                name: 'L1',
                size_kb: 32,
                line_size_bytes: 64,
                associativity: 4,
                access_time_ns: 1,
                policy: 'LRU',
            },
        ],
        memory: {
            size_kb: 2048,
            access_time_ns: 100,
        },
    });

    const [stats, setStats] = useState<SimulationStats | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [showConfig, setShowConfig] = useState(true);
    const [workload, setWorkload] = useState<WorkloadRequest>({
        pattern: 'sequential',
        num_accesses: 1000,
    });
    const [error, setError] = useState<string | null>(null);
    const [isConfigured, setIsConfigured] = useState(false);

    useEffect(() => {
        handleConfigure();
    }, []);

    const handleConfigure = async () => {
        try {
            setError(null);
            await configureSystem(config);
            setIsConfigured(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to configure system');
            console.error('Configuration error:', err);
        }
    };

    const handleSimulate = async () => {
        if (!isConfigured) {
            await handleConfigure();
        }

        try {
            setError(null);
            setIsSimulating(true);
            const result = await runSimulation(workload);
            setStats(result.stats);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Simulation failed');
            console.error('Simulation error:', err);
        } finally {
            setIsSimulating(false);
        }
    };

    const handleReset = async () => {
        try {
            setError(null);
            await resetSystem();
            setStats(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Reset failed');
            console.error('Reset error:', err);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg glow-primary">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-secondary-400">
                                Cache & Memory Hierarchy Simulator
                            </h1>
                            <p className="text-gray-400 mt-1">
                                Interactive exploration of cache behavior and memory performance
                            </p>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="max-w-7xl mx-auto mb-4"
                    >
                        <div className="bg-danger-900/20 border border-danger-500 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-danger-400">Error</h3>
                                <p className="text-danger-300 text-sm">{error}</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto text-danger-400 hover:text-danger-300"
                            >
                                ×
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left Panel - Configuration */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="xl:col-span-4"
                >
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 sticky top-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary-400" />
                                <h2 className="text-xl font-bold text-gray-100">Configuration</h2>
                            </div>
                            <button
                                onClick={() => setShowConfig(!showConfig)}
                                className="text-sm text-primary-400 hover:text-primary-300"
                            >
                                {showConfig ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        <AnimatePresence>
                            {showConfig && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <ConfigPanel
                                        config={config}
                                        setConfig={setConfig}
                                        workload={workload}
                                        setWorkload={setWorkload}
                                        onConfigure={handleConfigure}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Control Buttons */}
                        <div className="mt-6 space-y-3">
                            <button
                                onClick={handleSimulate}
                                disabled={isSimulating}
                                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 disabled:from-gray-700 disabled:to-gray-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 glow-primary disabled:glow-none"
                            >
                                {isSimulating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Simulating...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        Run Simulation
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleReset}
                                disabled={isSimulating}
                                className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 text-gray-200 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Reset System
                            </button>
                        </div>

                        {/* Quick Stats */}
                        {stats && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 bg-gradient-to-br from-primary-900/30 to-secondary-900/30 rounded-lg border border-primary-500/30"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp className="w-4 h-4 text-primary-400" />
                                    <h3 className="font-semibold text-gray-200">Quick Stats</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Instructions:</span>
                                        <span className="font-mono text-gray-200">
                                            {stats.instruction_count.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Cycles:</span>
                                        <span className="font-mono text-gray-200">
                                            {stats.total_cycles.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">CPI:</span>
                                        <span className="font-mono text-gray-200">{stats.cpi}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Speedup:</span>
                                        <span className="font-mono text-success-400">{stats.speedup}x</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Right Panel - Visualization and Results */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="xl:col-span-8 space-y-6"
                >
                    {/* Memory Hierarchy Visualization */}
                    <MemoryHierarchy config={config} stats={stats} />

                    {/* Results Section */}
                    {stats ? (
                        <>
                            {/* Metrics */}
                            <MetricsPanel stats={stats} />

                            {/* Visualization */}
                            <VisualizationPanel stats={stats} />

                            {/* Execution Log */}
                            <ExecutionLog logs={stats.execution_log} />
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-12 text-center"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center">
                                    <Play className="w-10 h-10 text-primary-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-200 mb-3">
                                    Ready to Simulate
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    Configure your cache hierarchy and memory system, then run a simulation to
                                    see how different parameters affect performance.
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-success-500 rounded-full" />
                                        <span>Adjust cache sizes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary-500 rounded-full" />
                                        <span>Change policies</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-secondary-500 rounded-full" />
                                        <span>Test workloads</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}