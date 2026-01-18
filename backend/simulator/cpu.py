from typing import List, Dict, Optional, Any
from .cache import Cache
from .memory import Memory
import random


class CPU:
    """Simulates CPU with cache hierarchy"""
    
    def __init__(self):
        self.caches: List[Cache] = []
        self.memory: Optional[Memory] = None
        self.total_cycles = 0
        self.instruction_count = 0
        self.wait_cycles = 0
        self.execution_log: List[Dict[str, Any]] = []
    
    def configure(self, config: Dict[str, Any]) -> None:
        """Configure CPU with cache hierarchy"""
        self.caches = []
        self.total_cycles = 0
        self.instruction_count = 0
        self.wait_cycles = 0
        self.execution_log = []
        
        # Create memory
        mem_config = config.get("memory", {})
        self.memory = Memory(
            size_kb=mem_config.get("size_kb", 1024),
            access_time_ns=mem_config.get("access_time_ns", 100)
        )
        
        # Create cache hierarchy
        cache_configs = config.get("caches", [])
        prev_cache = None
        
        for cache_config in cache_configs:
            cache = Cache(
                name=cache_config["name"],
                size_kb=cache_config["size_kb"],
                line_size_bytes=cache_config.get("line_size_bytes", 64),
                associativity=cache_config["associativity"],
                access_time_ns=cache_config["access_time_ns"],
                policy=cache_config.get("policy", "LRU")
            )
            
            if prev_cache:
                prev_cache.next_level = cache
            
            self.caches.append(cache)
            prev_cache = cache
        
        # Connect last cache to memory
        if prev_cache and self.memory:
            prev_cache.next_level = self.memory
    
    def execute_workload(self, workload_type: str, num_accesses: int) -> Dict[str, Any]:
        """
        Execute a workload pattern
        
        Args:
            workload_type: Type of memory access pattern
            num_accesses: Number of memory accesses to simulate
            
        Returns:
            Execution statistics
        """
        self.execution_log = []
        addresses = self._generate_access_pattern(workload_type, num_accesses)
        
        for i, address in enumerate(addresses):
            is_write = random.random() < 0.3  # 30% writes
            
            if is_write:
                access_time = self._write_memory(address, random.randint(0, 255))
                operation = "WRITE"
            else:
                access_time = self._read_memory(address)
                operation = "READ"
            
            self.instruction_count += 1
            self.total_cycles += access_time
            self.wait_cycles += access_time - 1  # Assume 1 cycle for computation
            
            # Log every Nth access to avoid too much data
            if i % max(1, num_accesses // 100) == 0:
                self.execution_log.append({
                    "instruction": i,
                    "operation": operation,
                    "address": f"0x{address:X}",
                    "access_time_ns": access_time,
                    "cumulative_cycles": self.total_cycles
                })
        
        return self.get_stats()
    
    def _generate_access_pattern(self, pattern_type: str, count: int) -> List[int]:
        """Generate memory access pattern"""
        addresses = []
        
        if pattern_type == "sequential":
            # Sequential access pattern
            base = random.randint(0, 10000) * 64
            for i in range(count):
                addresses.append(base + i * 4)
        
        elif pattern_type == "random":
            # Random access pattern
            for _ in range(count):
                addresses.append(random.randint(0, 2000) * 64)
        
        elif pattern_type == "strided":
            # Strided access pattern
            base = random.randint(0, 10000) * 64
            stride = 16  # 4 cache lines
            for i in range(count):
                addresses.append(base + i * stride)
        
        elif pattern_type == "locality":
            # Temporal locality - repeatedly access small region
            hot_regions = [random.randint(0, 10000) * 4 for _ in range(10)]
            for _ in range(count):
                region = random.choice(hot_regions)
                offset = random.randint(0, 4) * 4
                addresses.append(region + offset)
        
        else:  # mixed
            # Mixed pattern
            patterns = ["sequential", "random", "strided", "locality"]
            chunk_size = count // 4
            for pattern in patterns:
                addresses.extend(self._generate_access_pattern(pattern, chunk_size))
        
        return addresses
    
    def _read_memory(self, address: int) -> int:
        """Perform a memory read through cache hierarchy"""
        if self.caches:
            hit, access_time, events = self.caches[0].read(address)
            return access_time
        elif self.memory:
            _, access_time, _ = self.memory.read(address)
            return access_time
        return 0
    
    def _write_memory(self, address: int, data: int) -> int:
        """Perform a memory write through cache hierarchy"""
        if self.caches:
            return self.caches[0].write(address, data)
        elif self.memory:
            return self.memory.write(address, data)
        return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get comprehensive statistics"""
        cache_stats = [cache.get_stats() for cache in self.caches]
        memory_stats = self.memory.get_stats() if self.memory else {}
        
        # Calculate effective access time and speedup
        avg_access_time = self.total_cycles / max(1, self.instruction_count)
        memory_only_time = self.instruction_count * (memory_stats.get("access_time_ns", 100) if self.memory else 100)
        speedup = memory_only_time / max(1, self.total_cycles)
        
        # Calculate CPI (Cycles Per Instruction)
        cpi = self.total_cycles / max(1, self.instruction_count)
        
        return {
            "instruction_count": self.instruction_count,
            "total_cycles": self.total_cycles,
            "wait_cycles": self.wait_cycles,
            "avg_access_time_ns": round(avg_access_time, 2),
            "cpi": round(cpi, 2),
            "speedup": round(speedup, 2),
            "caches": cache_stats,
            "memory": memory_stats,
            "execution_log": self.execution_log[-50:]  # Return last 50 entries
        }
    
    def reset(self) -> None:
        """Reset CPU and all caches"""
        self.total_cycles = 0
        self.instruction_count = 0
        self.wait_cycles = 0
        self.execution_log = []
        
        for cache in self.caches:
            cache.reset()
        
        if self.memory:
            self.memory.reset()