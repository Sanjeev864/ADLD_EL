from typing import Dict, List, Optional, Any
from .policies import ReplacementPolicy, LRU, FIFO, LFU

class CacheLine:
    def __init__(self, tag: int = -1, data: int = 0, valid: bool = False, dirty: bool = False):
        self.tag = tag
        self.data = data
        self.valid = valid
        self.dirty = dirty

class Cache:
    def __init__(self, name: str, size_kb: int, line_size_bytes: int, associativity: int, access_time_ns: int, policy: str = "LRU"):
        self.name = name
        self.size_kb = size_kb
        self.size_bytes = size_kb * 1024
        self.line_size = line_size_bytes
        self.associativity = associativity
        self.access_time_ns = access_time_ns
        
        self.num_lines = self.size_bytes // self.line_size
        self.num_sets = self.num_lines // self.associativity
        
        self.sets: List[List[CacheLine]] = [
            [CacheLine() for _ in range(self.associativity)]
            for _ in range(self.num_sets)
        ]
        
        self.policies: List[ReplacementPolicy] = []
        for _ in range(self.num_sets):
            p = policy.upper()
            if p == "LRU": self.policies.append(LRU())
            elif p == "FIFO": self.policies.append(FIFO())
            elif p == "LFU": self.policies.append(LFU())
            else: self.policies.append(LRU())
        
        self.hits = 0
        self.misses = 0
        self.evictions = 0
        self.writebacks = 0
        self.next_level: Optional[Any] = None

    def _get_set_and_tag(self, address: int) -> tuple[int, int]:
        block_address = address // self.line_size
        set_index = block_address % self.num_sets
        tag = block_address // self.num_sets
        return set_index, tag

    def _handle_miss(self, address: int, set_idx: int, tag: int) -> tuple[int, List[str]]:
        """Internal logic to handle a miss without double-counting stats."""
        events = []
        fetch_time = 0
        
        # 1. Fetch from next level
        if self.next_level:
            _, nxt_time, nxt_events = self.next_level.read(address)
            fetch_time += nxt_time
            events.extend(nxt_events)
        
        # 2. Find victim
        victim_way = self._find_victim(set_idx, self.sets[set_idx])
        victim_line = self.sets[set_idx][victim_way]
        
        # 3. Handle Writeback (Dirty Victim)
        if victim_line.valid and victim_line.dirty:
            self.writebacks += 1
            events.append(f"{self.name} WRITEBACK from set {set_idx}")
            if self.next_level:
                # Correctly reconstruct the physical address for writeback
                wb_address = (victim_line.tag * self.num_sets + set_idx) * self.line_size
                fetch_time += self.next_level.write(wb_address, victim_line.data)
        
        # 4. Eviction stats
        if victim_line.valid:
            self.evictions += 1
            events.append(f"{self.name} EVICTION: Set {set_idx}, Way {victim_way}")

        # 5. Install new line
        victim_line.valid = True
        victim_line.tag = tag
        victim_line.data = address 
        victim_line.dirty = False
        self.policies[set_idx].access(victim_way)
        
        return fetch_time, events

    def read(self, address: int) -> tuple[bool, int, List[str]]:
        set_idx, tag = self._get_set_and_tag(address)
        events = []
        
        for way_idx, line in enumerate(self.sets[set_idx]):
            if line.valid and line.tag == tag:
                self.hits += 1
                self.policies[set_idx].access(way_idx)
                events.append(f"{self.name} HIT: 0x{address:X}")
                return True, self.access_time_ns, events
        
        self.misses += 1
        events.append(f"{self.name} MISS: 0x{address:X}")
        fetch_time, miss_events = self._handle_miss(address, set_idx, tag)
        events.extend(miss_events)
        
        return False, self.access_time_ns + fetch_time, events

    def write(self, address: int, data: int) -> int:
        set_idx, tag = self._get_set_and_tag(address)
        
        for way_idx, line in enumerate(self.sets[set_idx]):
            if line.valid and line.tag == tag:
                self.hits += 1
                line.data = data
                line.dirty = True
                self.policies[set_idx].access(way_idx)
                return self.access_time_ns
        
        self.misses += 1
        fetch_time, _ = self._handle_miss(address, set_idx, tag)
        
        # After miss handling, the line is now in cache; mark it dirty
        for line in self.sets[set_idx]:
            if line.valid and line.tag == tag:
                line.data = data
                line.dirty = True
                break
                
        return self.access_time_ns + fetch_time

    def _find_victim(self, set_idx: int, cache_set: List[CacheLine]) -> int:
        for way_idx, line in enumerate(cache_set):
            if not line.valid: return way_idx
        return self.policies[set_idx].evict()

    def get_stats(self) -> Dict:
        total = self.hits + self.misses
        return {
            "name": self.name,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round((self.hits / total * 100), 2) if total > 0 else 0,
            "evictions": self.evictions,
            "writebacks": self.writebacks
        }

    def reset(self) -> None:
        self.hits = self.misses = self.evictions = self.writebacks = 0
        for s in self.sets:
            for l in s:
                l.valid = l.dirty = False
                l.tag = -1
        for p in self.policies: p.reset()