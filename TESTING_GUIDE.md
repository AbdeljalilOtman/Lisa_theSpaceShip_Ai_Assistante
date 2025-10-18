# LISA Testing Guide

## Quick Start - Step by Step

### 1. Install Ollama (AI Model)
1. Download Ollama from: https://ollama.ai
2. Install it on your system
3. Open a terminal and run:
   ```bash
   ollama pull llama3.2
   ```
4. Wait for the model to download (this may take a few minutes)

### 2. Setup Backend (Python FastAPI)
Open a PowerShell terminal in the project folder:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

The backend should start on: http://localhost:8000

**Important**: Keep this terminal open while testing!

### 3. Setup Frontend (React)
Open a NEW PowerShell terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend should start on: http://localhost:5173

### 4. Test the Application

Open your browser and go to: **http://localhost:5173**

## Testing the Three Core Features

### 1️⃣ Environmental Monitoring
Try these voice commands or type them:
- "What's the environmental status?"
- "Check oxygen levels"
- "What's the current temperature?"
- "Show me CO2 levels"
- "Environmental report"

**Expected Response**: LISA will provide current readings for pressure, oxygen, CO2, and temperature.

### 2️⃣ Resource Management
Try these commands:
- "Check resource levels"
- "How much water do we have?"
- "What's our power status?"
- "Food inventory check"
- "Battery status"

**Expected Response**: LISA will report water supply, food remaining, power consumption, and battery levels.

### 3️⃣ System Control (Interactive!)
Try these control commands:
- "Increase temperature" or "Raise temperature"
- "Decrease temperature" or "Lower temperature"
- "Activate air filtration"

**Expected Response**: LISA will confirm the action and update the mission parameters in real-time. You'll see the changes reflected in the left panel!

## Voice Testing

1. **Click the microphone button** (blue circle icon)
2. Allow microphone access when prompted
3. Speak clearly: "Check oxygen levels"
4. LISA will respond with voice!

## Features to Demonstrate

### Visual Elements
- **Animated starfield background** - Moving stars in multiple layers
- **Glassmorphism UI** - Translucent panels with blur effects
- **Real-time metrics** - Watch values update when you control systems
- **Pulsing indicators** - Green dots show active systems
- **Gradient text and buttons** - Futuristic cyan/purple theme

### Interactive Elements
- **Voice input** - Click mic button and speak
- **Voice output** - LISA speaks responses
- **Quick action buttons** - Pre-filled common queries
- **Real-time updates** - Mission panel updates when you control systems
- **Typing indicator** - Shows when LISA is thinking

## Troubleshooting

### Backend won't start?
```powershell
# Make sure Python is installed
python --version

# Try installing dependencies again
pip install -r requirements.txt
```

### Ollama not working?
- Make sure Ollama is installed and running
- Try: `ollama list` to see if llama3.2 is installed
- The app will still work with fallback responses if Ollama is unavailable

### Frontend won't start?
```powershell
# Make sure Node.js is installed
node --version

# Clear cache and reinstall
rm -r node_modules
npm install
```

### Voice not working?
- Use Chrome or Edge browser (best support)
- Allow microphone permissions
- Check system microphone settings

## Demo Script for Competition

1. **Introduction** (30 seconds)
   - "This is LISA - Lunar Intelligence Support Assistant"
   - Show the futuristic UI and mission parameters

2. **Environmental Monitoring** (45 seconds)
   - Click mic and say: "Check environmental status"
   - Point out how LISA responds with voice
   - Show the real-time metrics on the left panel

3. **Resource Management** (45 seconds)
   - Type or say: "What are our resource levels?"
   - Show the progress bars updating
   - Demonstrate water, power, and food tracking

4. **System Control** (60 seconds)
   - Say: "Increase temperature"
   - **Watch the temperature value change in real-time!**
   - Say: "Activate air filtration"
   - **Watch CO2 levels drop!**
   - Explain how astronauts can control habitat systems

5. **Conclusion** (30 seconds)
   - "LISA helps astronauts monitor and control their habitat"
   - "Voice-activated for hands-free operation"
   - "Real-time feedback on all critical systems"

## Example Conversations

**Conversation 1: Morning Check**
- User: "Good morning LISA"
- LISA: "Good morning! I'm LISA, your mission support assistant..."
- User: "System status report"
- LISA: "All critical systems operational. Life support: operational..."

**Conversation 2: Environmental Concern**
- User: "I feel warm, what's the temperature?"
- LISA: "Current temperature is 22°C..."
- User: "Decrease temperature"
- LISA: "Temperature decreased to 20°C. Thermal control system adjusting."

**Conversation 3: Resource Planning**
- User: "How long until we need to resupply water?"
- LISA: "Water at 70% capacity, 850 liters remaining..."
- User: "What about food?"
- LISA: "140 days of food remaining..."

## Technical Architecture

```
┌─────────────────┐      HTTP/JSON      ┌──────────────────┐
│                 │◄────────────────────►│                  │
│  React Frontend │                      │  FastAPI Backend │
│   (Port 5173)   │                      │   (Port 8000)    │
│                 │                      │                  │
└─────────────────┘                      └────────┬─────────┘
        │                                         │
        │ Web Speech API                          │
        │ (Browser)                               │
        │                                         ▼
        ▼                                 ┌──────────────┐
  🎤 Microphone                          │    Ollama    │
  🔊 Speakers                             │  Llama 3.2   │
                                          └──────────────┘
```

## Performance Notes

- **Backend Response Time**: ~1-3 seconds (depending on Ollama)
- **Voice Recognition**: Instant (browser-based)
- **Voice Synthesis**: Instant (browser-based)
- **UI Updates**: Real-time (React state management)
- **Model Size**: Llama 3.2 (~2GB) - runs on most modern computers

## Competition Highlights

✅ **Lightweight**: Runs entirely on your local machine
✅ **No internet required**: After initial setup
✅ **Voice-activated**: Hands-free operation for astronauts
✅ **Real-time control**: Actual system control, not just information
✅ **Professional UI**: Futuristic, space-themed design
✅ **Realistic mission**: Based on actual Artemis mission parameters
✅ **Educational**: Shows real space habitat systems and constraints

Good luck with your NASA Space Apps Challenge! 🚀🌙
