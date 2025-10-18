# LISA - Setup Script for Windows PowerShell
# Run this script to set up the entire project

Write-Host "🚀 LISA - Space Mission AI Assistant Setup" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Check Python
Write-Host "`n📋 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.10 or higher." -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "`n📋 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

# Check Ollama
Write-Host "`n📋 Checking Ollama installation..." -ForegroundColor Yellow
try {
    $ollamaVersion = ollama --version
    Write-Host "✓ Ollama found: $ollamaVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ Ollama not found! Please install from https://ollama.ai" -ForegroundColor Yellow
    Write-Host "  The app will work with limited AI features without Ollama." -ForegroundColor Yellow
}

# Setup Backend
Write-Host "`n🔧 Setting up backend..." -ForegroundColor Yellow
Set-Location backend

if (Test-Path "venv") {
    Write-Host "Virtual environment already exists, skipping creation..." -ForegroundColor Gray
} else {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Gray
    python -m venv venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Gray
.\venv\Scripts\Activate.ps1

Write-Host "Installing Python dependencies..." -ForegroundColor Gray
pip install -r requirements.txt --quiet

Write-Host "✓ Backend setup complete!" -ForegroundColor Green

Set-Location ..

# Setup Frontend
Write-Host "`n🔧 Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

Write-Host "Installing Node.js dependencies..." -ForegroundColor Gray
npm install

Write-Host "✓ Frontend setup complete!" -ForegroundColor Green

Set-Location ..

# Pull Ollama model
Write-Host "`n🤖 Setting up AI model..." -ForegroundColor Yellow
try {
    Write-Host "Pulling Llama 3.2 model (this may take a few minutes)..." -ForegroundColor Gray
    ollama pull llama3.2
    Write-Host "✓ AI model ready!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not pull Ollama model. You can do this manually later:" -ForegroundColor Yellow
    Write-Host "  ollama pull llama3.2" -ForegroundColor Yellow
}

Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "✅ LISA Setup Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Open a terminal and run:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   python main.py" -ForegroundColor Gray
Write-Host "`n2. Open another terminal and run:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "`n3. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "`n🚀 Good luck with the NASA Space Apps Challenge!" -ForegroundColor Cyan
