from typing import Dict, List, Optional
import random


class Memory:
    """Simulates main memory (RAM)"""
    
    def __init__(self, size_kb: int = 1024, access_time_ns: int = 100):
        """
        Initialize memory
        
        Args:
            size_kb: Size of memory in kilobytes
            access_time_ns: Access latency in nanoseconds
        """
        self.size_kb = size_kb
        self.size_bytes = size_kb * 1024
        self.access_time_ns = access_time_ns
        self.data: Dict[int, int] = {}
        self.access_count = 0
        
        # Initialize with some random data
        self._initialize_data()
    
    def _initialize_data(self) -> None:
        """Initialize memory with random data"""
        # Create some realistic memory patterns
        num_blocks = min(1000, self.size_bytes // 64)  # 64-byte blocks
        for i in range(num_blocks):
            address = i * 64
            self.data[address] = random.randint(0, 255)
    
    def read(self, address: int) -> tuple[bool, int, list]:
        """
        Read from memory
        
        Args:
            address: Memory address to read
            
        Returns:
            Tuple of (hit, access_time, events)
        """
        self.access_count += 1
        
        # Normalize address to block boundary
        block_address = (address // 64) * 64
        
        if block_address not in self.data:
            self.data[block_address] = random.randint(0, 255)
        
        events = [f"MEMORY ACCESS at address 0x{address:X}"]
        return True, self.access_time_ns, events
    
    def write(self, address: int, data: int) -> int:
        """
        Write to memory
        
        Args:
            address: Memory address to write
            data: Data to write
            
        Returns:
            Access time in nanoseconds
        """
        self.access_count += 1
        block_address = (address // 64) * 64
        self.data[block_address] = data
        return self.access_time_ns
    
    def get_stats(self) -> Dict:
        """Get memory statistics"""
        return {
            "size_kb": self.size_kb,
            "access_time_ns": self.access_time_ns,
            "total_accesses": self.access_count,
            "blocks_used": len(self.data)
        }
    
    def reset(self) -> None:
        """Reset memory statistics"""
        self.access_count = 0