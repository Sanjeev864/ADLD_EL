from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from simulator.cpu import CPU
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Cache Simulator API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global CPU instance
cpu = CPU()


class CacheConfig(BaseModel):
    name: str
    size_kb: int
    line_size_bytes: int = 64
    associativity: int
    access_time_ns: int
    policy: str = "LRU"


class MemoryConfig(BaseModel):
    size_kb: int
    access_time_ns: int


class SystemConfig(BaseModel):
    caches: List[CacheConfig]
    memory: MemoryConfig


class WorkloadRequest(BaseModel):
    pattern: str
    num_accesses: int


@app.get("/")
def root():
    return {"message": "Cache Simulator API", "version": "1.0"}


@app.post("/configure")
def configure_system(config: SystemConfig):
    """Configure the cache hierarchy and memory system"""
    try:
        cpu.configure(config.dict())
        return {"status": "success", "message": "System configured successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/simulate")
def run_simulation(workload: WorkloadRequest):
    """Run a simulation with the given workload"""
    try:
        if not cpu.caches and not cpu.memory:
            raise HTTPException(
                status_code=400,
                detail="System not configured. Please configure first."
            )
        
        stats = cpu.execute_workload(workload.pattern, workload.num_accesses)
        return {"status": "success", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reset")
def reset_system():
    """Reset all statistics"""
    try:
        cpu.reset()
        return {"status": "success", "message": "System reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
def get_stats():
    """Get current system statistics"""
    try:
        stats = cpu.get_stats()
        return {"status": "success", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/presets")
def get_presets():
    """Get preset configurations"""
    return {
        "presets": [
            {
                "name": "Basic (L1 only)",
                "description": "Single L1 cache with memory",
                "config": {
                    "caches": [
                        {
                            "name": "L1",
                            "size_kb": 32,
                            "line_size_bytes": 64,
                            "associativity": 4,
                            "access_time_ns": 1,
                            "policy": "LRU"
                        }
                    ],
                    "memory": {
                        "size_kb": 2048,
                        "access_time_ns": 100
                    }
                }
            },
            {
                "name": "Two-Level (L1 + L2)",
                "description": "L1 and L2 cache hierarchy",
                "config": {
                    "caches": [
                        {
                            "name": "L1",
                            "size_kb": 32,
                            "line_size_bytes": 64,
                            "associativity": 4,
                            "access_time_ns": 1,
                            "policy": "LRU"
                        },
                        {
                            "name": "L2",
                            "size_kb": 256,
                            "line_size_bytes": 64,
                            "associativity": 8,
                            "access_time_ns": 10,
                            "policy": "LRU"
                        }
                    ],
                    "memory": {
                        "size_kb": 4096,
                        "access_time_ns": 100
                    }
                }
            },
            {
                "name": "Three-Level (L1 + L2 + L3)",
                "description": "Complete three-level cache hierarchy",
                "config": {
                    "caches": [
                        {
                            "name": "L1",
                            "size_kb": 32,
                            "line_size_bytes": 64,
                            "associativity": 8,
                            "access_time_ns": 1,
                            "policy": "LRU"
                        },
                        {
                            "name": "L2",
                            "size_kb": 256,
                            "line_size_bytes": 64,
                            "associativity": 8,
                            "access_time_ns": 10,
                            "policy": "LRU"
                        },
                        {
                            "name": "L3",
                            "size_kb": 2048,
                            "line_size_bytes": 64,
                            "associativity": 16,
                            "access_time_ns": 30,
                            "policy": "LRU"
                        }
                    ],
                    "memory": {
                        "size_kb": 8192,
                        "access_time_ns": 100
                    }
                }
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)