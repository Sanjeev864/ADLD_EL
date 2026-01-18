from abc import ABC, abstractmethod
from typing import Dict, Any
from collections import OrderedDict
import time


class ReplacementPolicy(ABC):
    """Abstract base class for cache replacement policies"""
    
    @abstractmethod
    def access(self, key: int) -> None:
        """Record an access to a cache line"""
        pass
    
    @abstractmethod
    def evict(self) -> int:
        """Return the key to evict"""
        pass
    
    @abstractmethod
    def reset(self) -> None:
        """Reset the policy state"""
        pass


class LRU(ReplacementPolicy):
    """Least Recently Used replacement policy"""
    
    def __init__(self):
        self.access_order = OrderedDict()
        self.access_count = 0
    
    def access(self, key: int) -> None:
        """Move key to end (most recently used)"""
        if key in self.access_order:
            self.access_order.move_to_end(key)
        else:
            self.access_order[key] = self.access_count
        self.access_count += 1
    
    def evict(self) -> int:
        """Return least recently used key"""
        if not self.access_order:
            return -1
        key, _ = self.access_order.popitem(last=False)
        return key
    
    def reset(self) -> None:
        """Reset policy state"""
        self.access_order.clear()
        self.access_count = 0
    
    def remove(self, key: int) -> None:
        """Remove a key from tracking"""
        if key in self.access_order:
            del self.access_order[key]


class FIFO(ReplacementPolicy):
    """First In First Out replacement policy"""
    
    def __init__(self):
        self.queue = []
        self.access_times = {}
    
    def access(self, key: int) -> None:
        """Add key to queue if not present"""
        if key not in self.access_times:
            self.queue.append(key)
            self.access_times[key] = time.time()
    
    def evict(self) -> int:
        """Return first key in queue"""
        if not self.queue:
            return -1
        key = self.queue.pop(0)
        del self.access_times[key]
        return key
    
    def reset(self) -> None:
        """Reset policy state"""
        self.queue.clear()
        self.access_times.clear()
    
    def remove(self, key: int) -> None:
        """Remove a key from tracking"""
        if key in self.access_times:
            self.queue.remove(key)
            del self.access_times[key]


class LFU(ReplacementPolicy):
    """Least Frequently Used replacement policy"""
    
    def __init__(self):
        self.frequency = {}
        self.access_times = {}
    
    def access(self, key: int) -> None:
        """Increment frequency counter"""
        self.frequency[key] = self.frequency.get(key, 0) + 1
        self.access_times[key] = time.time()
    
    def evict(self) -> int:
        """Return least frequently used key (with LRU tie-breaking)"""
        if not self.frequency:
            return -1
        
        # Find minimum frequency
        min_freq = min(self.frequency.values())
        
        # Among keys with min frequency, find the least recently used
        candidates = [k for k, v in self.frequency.items() if v == min_freq]
        key = min(candidates, key=lambda k: self.access_times[k])
        
        del self.frequency[key]
        del self.access_times[key]
        return key
    
    def reset(self) -> None:
        """Reset policy state"""
        self.frequency.clear()
        self.access_times.clear()
    
    def remove(self, key: int) -> None:
        """Remove a key from tracking"""
        if key in self.frequency:
            del self.frequency[key]
            del self.access_times[key]