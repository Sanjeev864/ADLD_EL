'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Download } from 'lucide-react';
import { ExecutionLog as ExecutionLogType } from '@/types';

interface ExecutionLogProps {
    logs: ExecutionLogType[];
}

export default function ExecutionLog({ logs }: ExecutionLogProps) {
    const downloadLog = () => {
        const csvContent = [
            ['Instruction', 'Operation', 'Address', 'Access Time (ns)', 'Cumulative Cycles'].join(','),
            ...logs.map((log) =>
                [
                    log.instruction,
                    log.operation,
                    log.address,
                    log.access_time_ns,
                    log.cumulative_cycles,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'execution_log.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (!logs || logs.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-primary-400" />
                    <h2 className="text-xl font-bold text-gray-100">Execution Log</h2>
                    <span className="text-sm text-gray-500">
                        (Last {logs.length} operations)
                    </span>
                </div>
                <button
                    onClick={downloadLog}
                    className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            <div className="bg-gray-800/30 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800/50 sticky top-0">
                            <tr>
                                <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                                    Instruction #
                                </th>
                                <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                                    Operation
                                </th>
                                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Address</th>
                                <th className="text-right py-3 px-4 text-gray-400 font-semibold">
                                    Access Time
                                </th>
                                <th className="text-right py-3 px-4 text-gray-400 font-semibold">
                                    Cumulative Cycles
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, index) => (
                                <motion.tr
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="border-b border-gray-800 hover:bg-gray-800/20"
                                >
                                    <td className="py-3 px-4 text-gray-300 font-mono">
                                        {log.instruction}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${log.operation === 'READ'
                                                ? 'bg-primary-500/20 text-primary-400'
                                                : 'bg-secondary-500/20 text-secondary-400'
                                                }`}
                                        >
                                            {log.operation}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">
                                        {log.address}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-300 font-mono">
                                        {log.access_time_ns} ns
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-300 font-mono">
                                        {log.cumulative_cycles.toLocaleString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}