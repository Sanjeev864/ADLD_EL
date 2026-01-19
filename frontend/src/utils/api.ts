import axios from 'axios';
import { SystemConfig, WorkloadRequest, SimulationStats, Preset } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const configureSystem = async (config: SystemConfig): Promise<{ status: string; message: string }> => {
    const response = await api.post('/configure', config);
    return response.data;
};

export const runSimulation = async (workload: WorkloadRequest): Promise<{ status: string; stats: SimulationStats }> => {
    const response = await api.post('/simulate', workload);
    return response.data;
};

export const resetSystem = async (): Promise<{ status: string; message: string }> => {
    const response = await api.post('/reset');
    return response.data;
};

export const getStats = async (): Promise<{ status: string; stats: SimulationStats }> => {
    const response = await api.get('/stats');
    return response.data;
};

export const getPresets = async (): Promise<Preset[]> => {
    const response = await api.get('/presets');
    return response.data.presets;
};