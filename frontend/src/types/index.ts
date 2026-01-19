export interface CacheConfig {
    name: string;
    size_kb: number;
    line_size_bytes: number;
    associativity: number;
    access_time_ns: number;
    policy: string;
}

export interface MemoryConfig {
    size_kb: number;
    access_time_ns: number;
}

export interface SystemConfig {
    caches: CacheConfig[];
    memory: MemoryConfig;
}

export interface CacheStats {
    name: string;
    size_kb: number;
    line_size: number;
    associativity: number;
    access_time_ns: number;
    num_sets: number;
    hits: number;
    misses: number;
    hit_rate: number;
    miss_rate: number;
    evictions: number;
    writebacks: number;
    total_accesses: number;
}

export interface MemoryStats {
    size_kb: number;
    access_time_ns: number;
    total_accesses: number;
    blocks_used: number;
}

export interface ExecutionLog {
    instruction: number;
    operation: string;
    address: string;
    access_time_ns: number;
    cumulative_cycles: number;
}

export interface SimulationStats {
    instruction_count: number;
    total_cycles: number;
    wait_cycles: number;
    avg_access_time_ns: number;
    cpi: number;
    speedup: number;
    caches: CacheStats[];
    memory: MemoryStats;
    execution_log: ExecutionLog[];
}

export interface WorkloadRequest {
    pattern: string;
    num_accesses: number;
}

export interface Preset {
    name: string;
    description: string;
    config: SystemConfig;
}