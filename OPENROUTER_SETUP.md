# OpenRouter API Setup (FREE & FAST)

## Why OpenRouter?
- ✅ **FREE models available** (Llama 3.2 3B)
- ✅ **10x FASTER** than local Ollama
- ✅ **Cloud-based** - no local GPU needed
- ✅ **Sub-second responses**

## Quick Setup (2 minutes)

### Step 1: Get Free API Key
1. Go to https://openrouter.ai/
2. Click **"Sign In"** (top right)
3. Sign in with Google/GitHub (instant, no credit card needed)
4. Click your profile → **"Keys"**
5. Click **"Create Key"**
6. Copy your API key (starts with `sk-or-v1-...`)

### Step 2: Set API Key (Windows)

**Option A: Environment Variable (Recommended)**
```powershell
# In PowerShell (run as administrator)
setx OPENROUTER_API_KEY "your-api-key-here"
```

**Option B: Direct in Code**
Edit `backend/main.py` line 11:
```python
OPENROUTER_API_KEY = "sk-or-v1-your-actual-key-here"
```

### Step 3: Restart Backend
```powershell
cd "c:\Users\Abdeljalil Otman\Desktop\nasa APP challenge\backend"
python main.py
```

## Free Models Available

The backend uses **`meta-llama/llama-3.2-3b-instruct:free`** by default.

Other fast free options:
- `google/gemini-flash-1.5:free` - Google's fast model
- `meta-llama/llama-3.2-1b-instruct:free` - Ultra fast, smaller

## Speed Comparison

**Local Ollama:**
- Response time: 3-5 seconds
- Requires GPU/CPU power
- ❌ Slow on laptops

**OpenRouter (Free):**
- Response time: 0.5-1 second ⚡
- Cloud-based
- ✅ 5-10x FASTER!

## How It Works

1. You speak to LISA
2. Backend sends request to OpenRouter API (cloud)
3. OpenRouter's fast servers process instantly
4. Response returns in ~0.5 seconds
5. LISA speaks the answer

**Total delay: ~1 second instead of 5 seconds!**

## Fallback System

The backend has 3 layers:
1. **Primary:** OpenRouter API (fastest, free)
2. **Backup:** Local Ollama (if OpenRouter fails)
3. **Fallback:** Predefined responses (instant, always works)

## No API Key?

If you don't set an API key, the backend will:
1. Try OpenRouter (will fail without key)
2. Fall back to Ollama (if installed)
3. Use instant predefined responses

Still works, just less intelligent responses!

## Troubleshooting

**"OpenRouter API error: 401"**
- Your API key is invalid
- Make sure you copied the full key including `sk-or-v1-`

**"OpenRouter API error: 429"**
- Rate limit reached (rare on free tier)
- Will automatically fall back to Ollama or predefined responses

**Still slow?**
- Check your internet connection
- Try switching to `google/gemini-flash-1.5:free` model (edit line 147 in main.py)

## Free Tier Limits

OpenRouter free tier:
- ✅ Unlimited requests per day (with reasonable use)
- ✅ No credit card required
- ✅ No expiration

Perfect for NASA Space Apps Challenge! 🚀
