import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Mic, MicOff, Activity, Droplet, Zap, 
  Thermometer, Wind, Battery, Radio, Moon
} from 'lucide-react';
import './App.css';

const API_URL = 'http://localhost:8000';

function App() {
  const [missionData, setMissionData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize global speaking flag
  if (typeof window.lisaSpeaking === 'undefined') {
    window.lisaSpeaking = false;
  }

  console.log('App rendering - isListening:', isListening, 'isSpeaking:', isSpeaking);

  // Fetch mission data on mount
  useEffect(() => {
    fetchMissionData();
    initSpeechRecognition();
    
    // Load voices for text-to-speech
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        console.log('Total voices:', voices.length);
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Welcome message
    setTimeout(() => {
      const welcomeMsg = {
        type: 'assistant',
        text: "Hello, I'm LISA. I'm always listening. Just speak your command.",
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
      speak(welcomeMsg.text);
    }, 1000);

    // Start continuous listening after welcome message completes
    // No need for manual start - speak() will restart listening automatically
    
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMissionData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/mission`);
      setMissionData(response.data);
    } catch (error) {
      console.error('Error fetching mission data:', error);
    }
  };

  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;  // Continuous listening
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        // CRITICAL: Ignore results if LISA is speaking
        if (window.lisaSpeaking) {
          console.log('🚫 Ignoring command - LISA is speaking');
          return;
        }
        
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('✅ Command received:', transcript);
        setInputMessage(transcript);
        
        // Send message immediately
        console.log('📤 Sending to LISA...');
        sendMessageWithText(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        // Ignore harmless errors
        if (event.error === 'aborted' || event.error === 'no-speech') {
          console.log('Speech recognition:', event.error);
          return;
        }
        
        console.error('Speech recognition error:', event.error);
        // Auto-restart on error
        setTimeout(() => startContinuousListening(), 1000);
      };

      recognitionRef.current.onend = () => {
        console.log('🔄 Recognition ended');
        // Only auto-restart if we're not in speaking state
        // Use a ref check instead of state to avoid race conditions
        if (!window.lisaSpeaking) {
          console.log('🔄 Restarting listening...');
          setTimeout(() => startContinuousListening(), 500);
        } else {
          console.log('⏸️ Not restarting - LISA is speaking');
        }
      };
    }
  };

  const startContinuousListening = () => {
    // Don't start if LISA is speaking
    if (window.lisaSpeaking) {
      console.log('⏸️ Cannot start listening - LISA is speaking');
      return;
    }
    
    if (recognitionRef.current) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
        console.log('👂 LISA is now continuously listening...');
      } catch (error) {
        if (error.message && error.message.includes('already started')) {
          console.log('✓ Already listening');
          setIsListening(true);
        } else {
          console.error('Error starting recognition:', error);
          setTimeout(() => startContinuousListening(), 2000);
        }
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      startContinuousListening();
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // CRITICAL: Set speaking flag IMMEDIATELY before anything else
      console.log('🔊 LISA preparing to speak - setting flag');
      window.lisaSpeaking = true;
      setIsSpeaking(true);
      
      // CRITICAL: Stop microphone IMMEDIATELY
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          setIsListening(false);
          console.log('✅ Microphone FORCE STOPPED before speech');
        } catch (e) {
          console.log('Microphone stop attempt:', e.message);
        }
      }
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Process text to sound more natural and conversational
      const processedText = makeTextMoreNatural(text);
      
      const utterance = new SpeechSynthesisUtterance(processedText);
      
      // Get available voices and select the best female voice
      const voices = window.speechSynthesis.getVoices();
      
      // Enhanced priority order for most natural-sounding female voices
      const femaleVoiceNames = [
        // Microsoft voices (Windows) - Very natural
        'Microsoft Zira Desktop',
        'Microsoft Zira',
        
        // Google voices - High quality and natural
        'Google US English Female',
        'Google UK English Female',
        'Google français Female',
        
        // Apple voices (macOS/iOS) - Excellent quality
        'Samantha',      // US English - Very natural
        'Allison',       // US English
        'Ava',           // US English
        'Susan',         // US English
        'Victoria',      // US English
        'Karen',         // Australian English
        'Moira',         // Irish English
        'Tessa',         // South African English
        'Kate',          // UK English
        'Serena',        // UK English
        'Fiona',         // Scottish English
        
        // Edge voices (if available)
        'Microsoft Aria Online',
        'Microsoft Jenny Online',
        
        // Android voices
        'en-US-language',
        'English United States'
      ];
      
      let selectedVoice = null;
      
      // Try to find the best female voice with exact match first
      for (const voiceName of femaleVoiceNames) {
        selectedVoice = voices.find(voice => voice.name === voiceName);
        if (selectedVoice) {
          console.log('🎤 Perfect match found:', selectedVoice.name);
          break;
        }
      }
      
      // If no exact match, try partial match
      if (!selectedVoice) {
        for (const voiceName of femaleVoiceNames) {
          selectedVoice = voices.find(voice => voice.name.includes(voiceName));
          if (selectedVoice) {
            console.log('🎤 Partial match found:', selectedVoice.name);
            break;
          }
        }
      }
      
      // Fallback: any voice with "female" or feminine characteristics
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('aria') ||
          voice.name.toLowerCase().includes('jenny') ||
          voice.name.toLowerCase().includes('samantha') ||
          (voice.lang.includes('en') && 
           !voice.name.includes('David') && 
           !voice.name.includes('Mark') &&
           !voice.name.includes('Google UK English Male'))
        );
        if (selectedVoice) {
          console.log('🎤 Fallback voice found:', selectedVoice.name);
        }
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using voice:', selectedVoice.name);
      } else {
        console.log('⚠️ No ideal female voice found, using default');
      }
      
      // Enhanced voice settings for more natural, warm, human-like female sound
      // Slightly slower rate makes speech clearer and more pleasant
      utterance.rate = 0.85;  // Increased from 0.75 for more natural pace
      
      // Higher pitch for feminine sound but not too high (sounds more natural)
      utterance.pitch = 1.15;  // Slightly lower from 1.2 for more mature, professional sound
      
      // Full volume for clarity
      utterance.volume = 1;
      
      utterance.onstart = () => {
        console.log('🔊 LISA started speaking');
        // Double-check microphone is stopped
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            setIsListening(false);
            console.log('✅ Microphone confirmed deactivated during speech');
          } catch (e) {
            console.log('Microphone already stopped');
          }
        }
      };
      
      utterance.onend = () => {
        console.log('✅ LISA finished speaking');
        window.lisaSpeaking = false;
        setIsSpeaking(false);
        // Restart continuous listening after speaking
        setTimeout(() => {
          console.log('🎤 Reactivating microphone...');
          startContinuousListening();
        }, 1000);
      };
      
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        window.lisaSpeaking = false;
        setIsSpeaking(false);
        setTimeout(() => startContinuousListening(), 1000);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Function to make text sound more natural and conversational
  const makeTextMoreNatural = (text) => {
    let processed = text;
    
    // Add natural pauses with commas where appropriate
    processed = processed.replace(/\. ([A-Z])/g, '. ... $1'); // Pause between sentences
    
    // Make abbreviations sound better
    processed = processed.replace(/\bpsi\b/gi, 'P S I');
    processed = processed.replace(/\bkW\b/g, 'kilowatts');
    processed = processed.replace(/\bkw\b/gi, 'kilowatts');
    processed = processed.replace(/\bppm\b/gi, 'parts per million');
    processed = processed.replace(/\bCO2\b/g, 'C O 2');
    processed = processed.replace(/\bO2\b/g, 'oxygen');
    processed = processed.replace(/\bH2O\b/g, 'water');
    
    // Make numbers sound more natural
    processed = processed.replace(/(\d+)°C/g, '$1 degrees Celsius');
    processed = processed.replace(/(\d+)°F/g, '$1 degrees Fahrenheit');
    processed = processed.replace(/(\d+)%/g, '$1 percent');
    processed = processed.replace(/(\d+)L\b/g, '$1 liters');
    
    // Add conversational fillers occasionally for warmth (randomly)
    const conversationalStarters = [
      '', '', '', // Most of the time, no filler (75% chance)
      'Well, ',
      'So, ',
      'Alright, ',
      'Let me see, ',
      'Okay, '
    ];
    
    // Only add conversational starter if text doesn't already start naturally
    if (!processed.match(/^(Well|So|Alright|Let me|Okay|Hello|Hi|Sure)/i) && 
        processed.length > 20 && 
        !processed.includes('...')) {
      const starter = conversationalStarters[Math.floor(Math.random() * conversationalStarters.length)];
      processed = starter + processed;
    }
    
    // Make responses more natural and friendly
    processed = processed.replace(/^The /i, 'The ');
    processed = processed.replace(/\bOK\b/gi, 'okay');
    processed = processed.replace(/\bok\b/gi, 'okay');
    
    // Add slight emphasis to important words (Web Speech API has limited support, but we try)
    // This mainly helps with pacing
    processed = processed.replace(/\bWARNING\b/gi, '... WARNING ...');
    processed = processed.replace(/\bALERT\b/gi, '... ALERT ...');
    processed = processed.replace(/\bCRITICAL\b/gi, '... CRITICAL ...');
    processed = processed.replace(/\bURGENT\b/gi, '... URGENT ...');
    
    return processed;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    await sendMessageWithText(inputMessage);
  };

  const sendMessageWithText = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      type: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: text
      });

      const assistantMsg = {
        type: 'assistant',
        text: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
      speak(response.data.response);

      // Update mission data if it was modified
      if (response.data.mission_data) {
        setMissionData(response.data.mission_data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = {
        type: 'assistant',
        text: "I'm experiencing communication difficulties. Please check the backend connection.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!missionData) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Initializing LISA Systems...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Static Background */}
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      {/* Header */}
      <header className="header glass">
        <div className="logo-section">
          <Moon className="logo-icon" size={32} />
          <div>
            <h1>LISA</h1>
            <p className="subtitle">Lunar Intelligence Support Assistant</p>
          </div>
        </div>
        <div className="mission-badge">
          <Radio size={16} className="pulse" />
          <span>{missionData.mission_name}</span>
        </div>
      </header>

      {/* Main Content - Centered Layout */}
      <div className="main-content-centered">
        
        {/* Centered AI Assistant */}
        <main className="chat-container-centered glass">
          <div className="ai-assistant-display">
            <div className={`abstract-ai-core ${isSpeaking ? 'speaking' : ''} ${isListening ? 'listening' : ''}`}>
              {/* Central Energy Core */}
              <div className="energy-core">
                <div className="core-inner"></div>
                <div className="core-pulse"></div>
              </div>
              
              {/* Orbiting Geometric Shapes */}
              <div className="orbital-elements">
                <div className="orbital-ring ring-1">
                  <div className="geo-shape cube"></div>
                </div>
                <div className="orbital-ring ring-2">
                  <div className="geo-shape pyramid"></div>
                </div>
                <div className="orbital-ring ring-3">
                  <div className="geo-shape sphere"></div>
                </div>
              </div>
              
              {/* Data Stream Lines */}
              <svg className="data-streams" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="streamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#00fff9', stopOpacity: 0 }} />
                    <stop offset="50%" style={{ stopColor: '#00fff9', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#00fff9', stopOpacity: 0 }} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                <circle cx="150" cy="150" r="100" fill="none" stroke="#00fff9" strokeWidth="1" opacity="0.3" className="neural-ring"/>
                <circle cx="150" cy="150" r="120" fill="none" stroke="#00ff88" strokeWidth="1" opacity="0.2" className="neural-ring"/>
                <circle cx="150" cy="150" r="140" fill="none" stroke="#0088ff" strokeWidth="1" opacity="0.1" className="neural-ring"/>
                
                {/* Neural connection nodes */}
                <circle cx="150" cy="50" r="3" fill="#00fff9" className="node" filter="url(#glow)"/>
                <circle cx="250" cy="150" r="3" fill="#00fff9" className="node" filter="url(#glow)"/>
                <circle cx="150" cy="250" r="3" fill="#00fff9" className="node" filter="url(#glow)"/>
                <circle cx="50" cy="150" r="3" fill="#00fff9" className="node" filter="url(#glow)"/>
                
                {/* Connection lines */}
                <line x1="150" y1="50" x2="150" y2="150" stroke="url(#streamGradient)" strokeWidth="1" className="stream-line" opacity="0.5"/>
                <line x1="250" y1="150" x2="150" y2="150" stroke="url(#streamGradient)" strokeWidth="1" className="stream-line" opacity="0.5"/>
                <line x1="150" y1="250" x2="150" y2="150" stroke="url(#streamGradient)" strokeWidth="1" className="stream-line" opacity="0.5"/>
                <line x1="50" y1="150" x2="150" y2="150" stroke="url(#streamGradient)" strokeWidth="1" className="stream-line" opacity="0.5"/>
              </svg>
              
              {/* Floating Data Particles */}
              <div className="data-particles">
                <div className="data-particle p1"></div>
                <div className="data-particle p2"></div>
                <div className="data-particle p3"></div>
                <div className="data-particle p4"></div>
                <div className="data-particle p5"></div>
                <div className="data-particle p6"></div>
                <div className="data-particle p7"></div>
                <div className="data-particle p8"></div>
              </div>
              
              {/* LISA Label */}
              <div className="ai-label">LISA</div>
              <div className="ai-sublabel">Lunar Intelligence System</div>
            </div>
          </div>

          <div className="voice-status-display">
            <p className="voice-hint" style={{ 
              color: isListening ? '#00ff88' : isSpeaking ? 'cyan' : 'rgba(255, 255, 255, 0.7)', 
              fontSize: '18px',
              textAlign: 'center',
              fontWeight: '600',
              letterSpacing: '0.5px',
              margin: '30px 0'
            }}>
              {isListening ? '👂 Listening... Speak your command' : isSpeaking ? '🔊 LISA is speaking...' : 'Ready'}
            </p>
          </div>

          <div className="quick-actions">
            <button onClick={() => { sendMessageWithText("What's the environmental status?"); }}>
              📊 Environment
            </button>
            <button onClick={() => { sendMessageWithText("Check resource levels"); }}>
              💧 Resources
            </button>
            <button onClick={() => { sendMessageWithText("System status report"); }}>
              🔧 Systems
            </button>
          </div>
        </main>
        
        {/* Mission Parameters Panel - Below Assistant */}
        <aside className="mission-panel-bottom glass">
          <h2>Mission Status</h2>
          
          <div className="mission-stats-grid">
            <div className="stat-group">
              <h3>Environmental</h3>
              <div className="metrics-compact">
                <div className="metric-item">
                  <Thermometer size={16} />
                  <span>{missionData.environmental.temperature_celsius}°C</span>
                </div>
                <div className="metric-item">
                  <Wind size={16} />
                  <span>{missionData.environmental.pressure_psi} psi</span>
                </div>
                <div className="metric-item">
                  <Activity size={16} />
                  <span>{missionData.environmental.oxygen_percent}% O₂</span>
                </div>
                <div className="metric-item">
                  <Wind size={16} />
                  <span>{missionData.environmental.co2_ppm} ppm CO₂</span>
                </div>
              </div>
            </div>

            <div className="stat-group">
              <h3>Resources</h3>
              <div className="metrics-compact">
                <div className="metric-item">
                  <Droplet size={16} />
                  <span>{missionData.resources.water_liters}L Water</span>
                </div>
                <div className="metric-item">
                  <Zap size={16} />
                  <span>{missionData.resources.power_kw}kW Power</span>
                </div>
                <div className="metric-item">
                  <Battery size={16} />
                  <span>{missionData.resources.battery_percent}% Battery</span>
                </div>
              </div>
            </div>

            <div className="stat-group">
              <h3>Systems</h3>
              <div className="system-status-compact">
                {Object.entries(missionData.systems).slice(0, 5).map(([key, value]) => (
                  <div key={key} className="status-item-compact">
                    <div className={`status-dot ${value.toLowerCase()}`}></div>
                    <span>{key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
