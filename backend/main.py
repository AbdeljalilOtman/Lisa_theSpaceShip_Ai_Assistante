from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import random
import os
import httpx
import json

# OpenRouter API Configuration (Free models available)
OPENROUTER_API_KEY = "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"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

# Try to import ollama as fallback, but don't fail if it's not available
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("Warning: Ollama package not installed. Using OpenRouter or fallback responses.")

app = FastAPI(title="LISA - Space Mission AI Assistant")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mission Parameters (Pre-configured)
MISSION_DATA = {
    "mission_name": "Artemis Moon Base Alpha",
    "crew_size": 4,
    "mission_duration_days": 180,
    "days_elapsed": 45,
    "habitat_type": "Inflatable Lunar Habitat Module",
    "location": "Shackleton Crater, Lunar South Pole",
    "environmental": {
        "pressure_psi": 14.7,
        "oxygen_percent": 21.0,
        "co2_ppm": 400,
        "temperature_celsius": 22.0,
        "humidity_percent": 45.0
    },
    "resources": {
        "water_liters": 850,
        "water_capacity": 1200,
        "food_days_remaining": 140,
        "power_kw": 12.5,
        "power_capacity_kw": 15.0,
        "battery_percent": 85
    },
    "systems": {
        "life_support": "operational",
        "air_filtration": "active",
        "thermal_control": "nominal",
        "communications": "online",
        "power_generation": "optimal"
    }
}

# System prompt for LISA (optimized for speed)
SYSTEM_PROMPT = f"""You are LISA, an AI assistant for astronauts on {MISSION_DATA['mission_name']}.

CURRENT STATUS:
Environment: {MISSION_DATA['environmental']['pressure_psi']} psi, O2 {MISSION_DATA['environmental']['oxygen_percent']}%, CO2 {MISSION_DATA['environmental']['co2_ppm']} ppm, {MISSION_DATA['environmental']['temperature_celsius']}°C
Resources: Water {MISSION_DATA['resources']['water_liters']}L, Food {MISSION_DATA['resources']['food_days_remaining']} days, Power {MISSION_DATA['resources']['power_kw']}kW, Battery {MISSION_DATA['resources']['battery_percent']}%
Systems: Life support {MISSION_DATA['systems']['life_support']}, Air filtration {MISSION_DATA['systems']['air_filtration']}, Thermal {MISSION_DATA['systems']['thermal_control']}

RULES:
- Keep responses to 1-2 sentences maximum
- Be professional and concise
- Report specific data when asked
- Confirm commands clearly
- For temperature control: acknowledge adjustments and confirm new value
- Temperature safe range: 18°C to 26°C

Respond as LISA."""

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    mission_data: dict | None = None

def adjust_temperature(current_temp: float, adjustment_value: float) -> float:
    """
    Adjust habitat temperature within safe limits (18°C - 26°C)
    
    Args:
        current_temp: Current temperature in Celsius
        adjustment_value: Value to add/subtract (can be negative)
    
    Returns:
        New temperature clamped to safe range
    """
    new_temp = current_temp + adjustment_value
    # Clamp to safe operational range
    new_temp = max(18.0, min(26.0, new_temp))
    return round(new_temp, 1)

@app.get("/")
async def root():
    return {"message": "LISA Backend API is running", "status": "operational"}

@app.get("/api/mission")
async def get_mission_data():
    """Get current mission parameters and status"""
    return MISSION_DATA

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process chat message with LISA AI"""
    try:
        user_message = request.message.lower()
        
        # Check if this is a system control command
        mission_updated = False
        control_response = None
        
        # Temperature control commands - enhanced with regex parsing
        import re
        
        # Detect temperature adjustment commands
        temp_keywords = [
            "temperature", "temp", "warmer", "cooler", "hotter", "colder",
            "heating", "cooling", "heat", "cool"
        ]
        
        if any(keyword in user_message for keyword in temp_keywords):
            current_temp = MISSION_DATA['environmental']['temperature_celsius']
            adjustment = 0
            target_temp = None
            
            # Parse "set to X" or "to X degrees"
            set_match = re.search(r'(?:set.*?to|to)\s+(\d+(?:\.\d+)?)', user_message)
            if set_match:
                target_temp = float(set_match.group(1))
                adjustment = target_temp - current_temp
            
            # Parse "by X degrees" or "X degrees"
            elif re.search(r'by\s+(\d+(?:\.\d+)?)', user_message):
                by_match = re.search(r'by\s+(\d+(?:\.\d+)?)', user_message)
                value = float(by_match.group(1))
                
                # Determine if increase or decrease
                if any(word in user_message for word in ["reduce", "decrease", "lower", "cool", "colder"]):
                    adjustment = -value
                else:
                    adjustment = value
            
            # Default adjustments based on keywords
            elif any(word in user_message for word in ["reduce", "decrease", "lower", "cool", "colder", "cooler"]):
                adjustment = -1.0  # Default decrease by 1°C
            elif any(word in user_message for word in ["increase", "raise", "warm", "heat", "hotter", "warmer"]):
                adjustment = 1.0   # Default increase by 1°C
            
            # Apply adjustment if we detected a command
            if adjustment != 0 or target_temp is not None:
                new_temp = adjust_temperature(current_temp, adjustment)
                MISSION_DATA['environmental']['temperature_celsius'] = new_temp
                
                # Generate appropriate response
                if new_temp == 18.0 and adjustment < 0:
                    control_response = f"Temperature reduced to minimum safe level: {new_temp} degrees Celsius."
                elif new_temp == 26.0 and adjustment > 0:
                    control_response = f"Temperature increased to maximum safe level: {new_temp} degrees Celsius."
                elif adjustment < 0:
                    control_response = f"Temperature reduced to {new_temp} degrees Celsius."
                else:
                    control_response = f"Temperature adjusted to {new_temp} degrees Celsius."
                
                mission_updated = True
            
        elif "activate air filtration" in user_message or "turn on air filter" in user_message:
            MISSION_DATA['systems']['air_filtration'] = "active"
            MISSION_DATA['environmental']['co2_ppm'] = max(300, MISSION_DATA['environmental']['co2_ppm'] - 50)
            control_response = f"Air filtration system activated. CO2 levels reducing to {MISSION_DATA['environmental']['co2_ppm']} ppm."
            mission_updated = True
        
        # Try OpenRouter API first (fastest)
        ai_response = None
        try:
            print(f"🤖 Processing message: {request.message}")
            ai_response = await get_openrouter_response(request.message, control_response)
            print(f"✅ OpenRouter response: {ai_response}")
        except Exception as e:
            print(f"❌ OpenRouter error: {e}")
            print(f"Trying Ollama fallback...")
            
            # Fallback to Ollama if OpenRouter fails
            try:
                if not OLLAMA_AVAILABLE:
                    raise Exception("Ollama not available")
                    
                response = ollama.chat(
                    model='llama3.2',
                    messages=[
                        {'role': 'system', 'content': SYSTEM_PROMPT},
                        {'role': 'user', 'content': request.message}
                    ],
                    options={
                        'temperature': 0.7,
                        'num_predict': 80,
                        'top_k': 40,
                        'top_p': 0.9,
                    }
                )
                
                ai_response = response['message']['content'].strip()
                
                if control_response:
                    ai_response = control_response
                    
            except Exception as e2:
                print(f"Ollama error: {e2}")
                # Final fallback to predefined responses
                ai_response = generate_fallback_response(user_message, control_response)
        
        return ChatResponse(
            response=ai_response,
            mission_data=MISSION_DATA if mission_updated else None
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

async def get_openrouter_response(user_message: str, control_response: str = None) -> str:
    """Get response from OpenRouter API using exact documentation format"""
    
    # If we had a control command, use that instead
    if control_response:
        return control_response
    
    # Use OpenRouter's exact format from documentation
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            url=OPENROUTER_BASE_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "http://localhost:5174",  # Optional. Site URL for rankings
                "X-Title": "LISA - NASA Space Apps",  # Optional. Site title for rankings
            },
            content=json.dumps({
                "model": "deepseek/deepseek-chat-v3.1:free",  # Faster and free! (~0.3s response)
                "messages": [
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            })
        )
        
        if response.status_code != 200:
            error_detail = response.text
            print(f"❌ OpenRouter API error {response.status_code}: {error_detail}")
            raise Exception(f"OpenRouter API error: {response.status_code}")
        
        data = response.json()
        ai_response = data["choices"][0]["message"]["content"].strip()
        
        print(f"✅ OpenRouter response received: {ai_response[:50]}...")
        return ai_response

def generate_fallback_response(user_message: str, control_response: str = None) -> str:
    """Generate fast fallback responses when Ollama is unavailable"""
    if control_response:
        return control_response
    
    msg = user_message.lower()
    
    # Environmental monitoring
    if any(word in msg for word in ["pressure", "oxygen", "co2", "temperature", "environment", "status"]):
        return f"All systems nominal. Pressure {MISSION_DATA['environmental']['pressure_psi']} psi, O2 {MISSION_DATA['environmental']['oxygen_percent']}%, Temperature {MISSION_DATA['environmental']['temperature_celsius']}°C."
    
    # Resource management
    if any(word in msg for word in ["water", "food", "power", "battery", "resources"]):
        return f"Resources good. Water {MISSION_DATA['resources']['water_liters']}L, Food {MISSION_DATA['resources']['food_days_remaining']} days, Battery {MISSION_DATA['resources']['battery_percent']}%."
    
    # System control
    if any(word in msg for word in ["system", "life support", "filtration", "thermal"]):
        return f"All systems operational. Life support {MISSION_DATA['systems']['life_support']}, Air filtration {MISSION_DATA['systems']['air_filtration']}."
    
    # Default greeting
    return "I'm LISA. I can monitor environment, check resources, and control systems. How can I help?"

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting LISA Backend Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
