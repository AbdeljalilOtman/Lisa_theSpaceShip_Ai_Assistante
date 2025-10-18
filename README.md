# LISA - Space Mission AI Assistant

An intelligent AI assistant for astronauts to monitor and control space habitat systems.

## Features
- 🎙️ Voice interaction (speech-to-text and text-to-speech)
- 🌡️ Real-time environmental monitoring
- 📊 Resource management tracking
- 🔧 System control capabilities
- 🎨 Futuristic, professional UI design

## Three Core Astronaut Tasks
1. **Environmental Monitoring**: Check habitat pressure, oxygen levels, CO2 levels, temperature
2. **Resource Management**: Query water supply, food inventory, power consumption
3. **System Control**: Adjust temperature, activate air filtration, check life support systems

## Tech Stack
- **Frontend**: React.js + Vite
- **Backend**: Python FastAPI
- **AI Model**: Ollama (Llama 3.2)
- **Voice**: Web Speech API

## Setup Instructions

### Prerequisites
1. Install Node.js (v18 or higher)
2. Install Python 3.10+
3. Install Ollama from https://ollama.ai

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
ollama pull llama3.2
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access the Application
Open http://localhost:5173 in your browser

## Mission Parameters (Pre-configured)
- Mission: Artemis Moon Base Alpha
- Crew Size: 4 astronauts
- Mission Duration: 180 days
- Habitat: Inflatable Lunar Habitat Module
- Location: Shackleton Crater, Lunar South Pole
