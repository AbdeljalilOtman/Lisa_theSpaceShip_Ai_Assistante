# LISA System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    Browser (localhost:5173)                     │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    REACT FRONTEND                         │ │
│  │                                                           │ │
│  │  ┌─────────────┐    ┌──────────────┐   ┌──────────────┐ │ │
│  │  │   Mission   │    │     Chat     │   │    Voice     │ │ │
│  │  │   Panel     │    │  Interface   │   │   Controls   │ │ │
│  │  │             │    │              │   │              │ │ │
│  │  │  • Metrics  │    │  • Messages  │   │  • Mic 🎤   │ │ │
│  │  │  • Status   │    │  • Input     │   │  • Speaker🔊│ │ │
│  │  │  • Progress │    │  • Typing    │   │              │ │ │
│  │  └─────────────┘    └──────────────┘   └──────────────┘ │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              │ HTTP/JSON (Axios)                │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                            │
│                   (localhost:8000)                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   API Endpoints                          │  │
│  │                                                          │  │
│  │  POST /api/chat        - Process user messages          │  │
│  │  GET  /api/mission     - Get mission data               │  │
│  │  GET  /                - Health check                   │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Mission State Manager                       │  │
│  │                                                          │  │
│  │  • Environmental Data (temp, O2, CO2, pressure)         │  │
│  │  • Resource Tracking (water, food, power)               │  │
│  │  • System Status (life support, filtration, etc.)       │  │
│  │  • Command Processing (temperature, filtration)         │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  AI Integration Layer                    │  │
│  │                                                          │  │
│  │  • System Prompt (Mission Context)                      │  │
│  │  • Ollama Client                                        │  │
│  │  • Fallback Responses                                   │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   OLLAMA SERVICE    │
                    │   (Local Machine)   │
                    │                     │
                    │   Llama 3.2 Model   │
                    │      (~2GB)         │
                    │                     │
                    └─────────────────────┘
```

## Data Flow - User Query

```
1. User speaks or types: "Check oxygen levels"
   │
   ▼
2. Web Speech API converts speech to text (if voice)
   │
   ▼
3. React sends HTTP POST to /api/chat with message
   │
   ▼
4. FastAPI receives request
   │
   ▼
5. Backend checks for system control commands
   │
   ▼
6. If control command → Update mission state
   │
   ▼
7. Send message + mission context to Ollama
   │
   ▼
8. Llama 3.2 generates response
   │
   ▼
9. FastAPI returns response + updated mission data
   │
   ▼
10. React updates UI (chat + mission panel if needed)
    │
    ▼
11. Web Speech API speaks the response
    │
    ▼
12. User hears LISA's answer
```

## Component Breakdown

### Frontend Components (React)

```
App.jsx
├── Header
│   ├── Logo (LISA)
│   └── Mission Badge
│
├── Mission Panel (Left Sidebar)
│   ├── Mission Info
│   │   ├── Location
│   │   ├── Crew Size
│   │   └── Mission Day
│   │
│   ├── Environmental Metrics
│   │   ├── Temperature Card
│   │   ├── Pressure Card
│   │   ├── Oxygen Card
│   │   └── CO2 Card
│   │
│   ├── Resource Bars
│   │   ├── Water Progress Bar
│   │   ├── Power Progress Bar
│   │   └── Battery Progress Bar
│   │
│   └── System Status
│       ├── Life Support Indicator
│       ├── Air Filtration Indicator
│       ├── Thermal Control Indicator
│       ├── Communications Indicator
│       └── Power Generation Indicator
│
└── Chat Container (Main Area)
    ├── Chat Header
    │   └── Assistant Info (with speaking animation)
    │
    ├── Messages Area
    │   ├── User Messages (right-aligned, gradient)
    │   ├── Assistant Messages (left-aligned, glass)
    │   └── Typing Indicator (when loading)
    │
    ├── Input Container
    │   ├── Mic Button (voice input)
    │   ├── Text Input (keyboard input)
    │   └── Send Button
    │
    └── Quick Actions
        ├── Environment Button
        ├── Resources Button
        └── Systems Button
```

### Backend Structure (Python)

```
main.py
├── FastAPI App
│   ├── CORS Middleware
│   └── Routes
│       ├── GET  /
│       ├── GET  /api/mission
│       └── POST /api/chat
│
├── Mission Data Dictionary
│   ├── mission_name
│   ├── crew_size
│   ├── mission_duration_days
│   ├── days_elapsed
│   ├── habitat_type
│   ├── location
│   ├── environmental {}
│   ├── resources {}
│   └── systems {}
│
├── System Prompt (Mission Context)
│
├── Chat Handler
│   ├── Command Detection
│   │   ├── Temperature Control
│   │   ├── Air Filtration
│   │   └── Other Commands
│   │
│   ├── Ollama Integration
│   │   └── Llama 3.2 Chat
│   │
│   └── Fallback Responses
│       ├── Environmental Queries
│       ├── Resource Queries
│       ├── System Queries
│       └── General Responses
│
└── Mission State Updates
```

## Technology Stack Details

### Frontend Stack
```
React 18.2.0          - UI framework
Vite 5.0.8            - Build tool & dev server
Axios 1.6.2           - HTTP client
Lucide React 0.294.0  - Icon library
Web Speech API        - Browser native (voice I/O)
```

### Backend Stack
```
FastAPI 0.104.1       - Web framework
Uvicorn 0.24.0        - ASGI server
Pydantic 2.5.0        - Data validation
Ollama 0.1.6          - AI model client
httpx 0.25.1          - Async HTTP client
```

### AI Stack
```
Ollama                - Local model runner
Llama 3.2             - Language model (2GB)
```

## System Requirements

### Development Environment
- **OS**: Windows 10/11 (also works on Mac/Linux)
- **RAM**: 8GB minimum (16GB recommended for Ollama)
- **Storage**: 5GB free (for Ollama model)
- **CPU**: Modern multi-core processor

### Software Requirements
- **Python**: 3.10 or higher
- **Node.js**: 18 or higher
- **Ollama**: Latest version
- **Browser**: Chrome, Edge (for best voice support)

## Network Ports

```
Frontend:  5173  (Vite dev server)
Backend:   8000  (FastAPI/Uvicorn)
Ollama:    11434 (Default Ollama port)
```

## Security Considerations

### CORS Configuration
- Allows localhost:5173 and localhost:5174
- Allows all methods for development
- Should be restricted for production

### Data Privacy
- All processing happens locally
- No data sent to cloud
- Mission data stored in memory only
- Resets on server restart

## Performance Metrics

### Response Times
- Frontend render: <100ms
- API request: 50-200ms
- Ollama response: 1-3 seconds
- Voice synthesis: <500ms
- Voice recognition: Real-time

### Resource Usage
- Frontend (React): ~50MB RAM
- Backend (FastAPI): ~100MB RAM
- Ollama (Llama 3.2): ~2-4GB RAM
- Total: ~4-5GB RAM

## Scalability Path

### Current (Demo)
```
1 User → 1 Mission → Local Machine
```

### Future (Production)
```
Multiple Users → Multiple Missions → Cloud Deployment
                                   → Database Storage
                                   → Load Balancing
                                   → Authentication
```

## Integration Points

### Can Integrate With:
- 🏠 Habitat Layout Tool (your team's main project)
- 📡 Real sensor hardware (IoT devices)
- 🗄️ Database systems (PostgreSQL, MongoDB)
- 📊 Analytics platforms (mission data analysis)
- 🚨 Alert systems (emergency protocols)
- 👥 User authentication (crew profiles)

## Deployment Options

### Local (Current)
```
Windows PowerShell → Python & Node.js → Browser
```

### Docker (Future)
```
docker-compose up → Containers → Browser
```

### Cloud (Production)
```
Azure/AWS → Kubernetes → Load Balancer → Users
```

---

This architecture is designed to be:
- ✅ **Modular** - Easy to extend and modify
- ✅ **Scalable** - Can grow from demo to production
- ✅ **Maintainable** - Clear separation of concerns
- ✅ **Testable** - Components can be tested independently
- ✅ **Performant** - Fast response times
- ✅ **Reliable** - Fallback mechanisms in place
