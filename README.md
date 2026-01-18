# Cache & Memory Hierarchy Simulator for Embedded Systems

An interactive full-stack application for simulating and visualizing cache memory behavior and memory hierarchy in embedded systems. This tool allows experimentation with cache size, mapping techniques, and replacement policies to study their impact on access latency and CPU performance.

![Cache Simulator](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🚀 Features

### Core Simulation Engine
- **Multi-level Cache Hierarchy**: Configure L1, L2, L3 caches with independent parameters
- **Flexible Cache Parameters**: 
  - Cache size (KB)
  - Line size (bytes)
  - Associativity (direct-mapped, N-way set associative, fully associative)
  - Access latency (nanoseconds)
- **Replacement Policies**: 
  - LRU (Least Recently Used)
  - FIFO (First In First Out)
  - LFU (Least Frequently Used)
- **Main Memory Configuration**: Customizable RAM size and access time

### Workload Patterns
- **Sequential Access**: Consecutive memory addresses
- **Random Access**: Unpredictable memory patterns
- **Strided Access**: Regular intervals between accesses
- **Temporal Locality**: Repeated access to hot regions
- **Mixed Pattern**: Combination of all patterns

### Visualization & Analysis
- 📊 Real-time performance metrics
- 📈 Interactive charts and graphs
- 🎯 Hit/Miss rate analysis
- ⚡ CPI (Cycles Per Instruction) calculation
- 🚀 Speedup comparison vs memory-only access
- 📋 Detailed execution logs with CSV export
- 🎨 Beautiful gradient UI with animations

## 📁 Project Structure
```
cache-simulator/
├── backend/
│   ├── main.py                 # FastAPI server and endpoints
│   ├── simulator/
│   │   ├── __init__.py
│   │   ├── cache.py           # Cache implementation
│   │   ├── memory.py          # Memory simulation
│   │   ├── cpu.py             # CPU and workload execution
│   │   └── policies.py        # Replacement policy algorithms
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── Simulator.tsx          # Main simulator component
│   │   │   ├── ConfigPanel.tsx        # Configuration interface
│   │   │   ├── VisualizationPanel.tsx # Charts and graphs
│   │   │   ├── MetricsPanel.tsx       # Performance metrics
│   │   │   ├── MemoryHierarchy.tsx    # Visual hierarchy
│   │   │   └── ExecutionLog.tsx       # Operation log
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── api.ts
│   └── .env.local
└── README.md
```

## 🛠️ Technologies Used

### Backend
- **Python 3.8+**: Core simulation engine
- **FastAPI**: High-performance REST API
- **Pydantic**: Data validation
- **NumPy**: Numerical computations
- **Uvicorn**: ASGI server

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization
- **Framer Motion**: Smooth animations
- **Lucide React**: Beautiful icons
- **Axios**: HTTP client

## 📦 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create and activate virtual environment:**
```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Create `.env` file (optional):**
```env
PORT=8000
HOST=0.0.0.0
```

5. **Run the server:**
```bash
python main.py
```

The API will be available at `http://localhost:8000`

**API Documentation:** Visit `http://localhost:8000/docs` for interactive API documentation

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Create `.env.local` file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Run development server:**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
# Frontend
npm run build
npm start

# Backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🎮 Usage Guide

### 1. Configure Cache Hierarchy

**Quick Presets:**
- Basic (L1 only)
- Two-Level (L1 + L2)
- Three-Level (L1 + L2 + L3)

**Custom Configuration:**
- Add/Remove cache levels
- Adjust size, associativity, and latency
- Select replacement policy (LRU, FIFO, LFU)

### 2. Configure Main Memory

- Set memory size (KB)
- Define access time (nanoseconds)

### 3. Select Workload

- Choose access pattern
- Set number of memory accesses (100 - 100,000)

### 4. Run Simulation

Click **"Run Simulation"** to execute the workload and view results

### 5. Analyze Results

**Performance Metrics:**
- Instruction count
- Total cycles
- CPI (Cycles Per Instruction)
- Speedup vs memory-only
- Average access time
- Memory accesses

**Cache Statistics:**
- Hit/Miss rates per cache level
- Evictions and writebacks
- Total accesses per level

**Visualizations:**
- Hit/Miss rate comparison charts
- Access time hierarchy
- Eviction and writeback statistics
- Execution timeline

**Execution Log:**
- Detailed operation history
- Export to CSV for analysis

## 📊 API Endpoints

### Configuration
```http
POST /configure
Content-Type: application/json

{
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
```

### Run Simulation
```http
POST /simulate
Content-Type: application/json

{
  "pattern": "sequential",
  "num_accesses": 1000
}
```

### Get Statistics
```http
GET /stats
```

### Reset System
```http
POST /reset
```

### Get Presets
```http
GET /presets
```

## 🧪 Example Scenarios

### Scenario 1: Impact of Cache Size
1. Configure L1 with 32 KB
2. Run sequential workload
3. Note hit rate
4. Increase L1 to 64 KB
5. Run same workload
6. Compare performance improvement

### Scenario 2: Replacement Policy Comparison
1. Configure L1 with LRU policy
2. Run random workload
3. Note evictions and hit rate
4. Change to FIFO policy
5. Run same workload
6. Compare results

### Scenario 3: Multi-level Hierarchy Benefits
1. Configure single L1 cache
2. Run mixed workload
3. Note CPI and speedup
4. Add L2 and L3 caches
5. Run same workload
6. Observe performance gains

## 🎨 UI Features

- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: Framer Motion powered
- **Responsive Design**: Works on all screen sizes
- **Interactive Charts**: Hover for detailed information
- **Real-time Updates**: Live performance metrics
- **Dark Theme**: Easy on the eyes
- **Glow Effects**: Visual feedback for important elements

## 🔧 Configuration Examples

### High-Performance Setup
```json
{
  "caches": [
    {
      "name": "L1",
      "size_kb": 64,
      "associativity": 8,
      "access_time_ns": 1,
      "policy": "LRU"
    },
    {
      "name": "L2",
      "size_kb": 512,
      "associativity": 16,
      "access_time_ns": 10,
      "policy": "LRU"
    }
  ],
  "memory": {
    "size_kb": 8192,
    "access_time_ns": 100
  }
}
```

### Embedded System Setup
```json
{
  "caches": [
    {
      "name": "L1",
      "size_kb": 16,
      "associativity": 2,
      "access_time_ns": 2,
      "policy": "FIFO"
    }
  ],
  "memory": {
    "size_kb": 1024,
    "access_time_ns": 150
  }
}
```

## 📝 Performance Metrics Explained

- **Hit Rate**: Percentage of memory accesses found in cache
- **Miss Rate**: Percentage of memory accesses not found in cache
- **CPI (Cycles Per Instruction)**: Average cycles needed per instruction
- **Speedup**: Performance improvement vs accessing memory directly
- **Evictions**: Number of cache lines replaced
- **Writebacks**: Number of dirty cache lines written to memory

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port in .env file or:
python main.py --port 8001
```

**Module not found:**
```bash
pip install -r requirements.txt
```

### Frontend Issues

**Cannot connect to backend:**
- Verify backend is running on port 8000
- Check `.env.local` has correct API URL
- Ensure no CORS issues

**Build errors:**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Cache & Memory Hierarchy Simulator Team

## 🙏 Acknowledgments

- Inspired by computer architecture and embedded systems courses
- Built for educational purposes and performance analysis
- Special thanks to the open-source community

## 📧 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Happy Simulating! 🚀**