# LISA - System Check Script
# Run this to verify all prerequisites are installed

Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "🚀 LISA System Requirements Check" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan

$allGood = $true

# Check Python
Write-Host "`n📋 Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python (\d+)\.(\d+)") {
        $major = [int]$matches[1]
        $minor = [int]$matches[2]
        if ($major -ge 3 -and $minor -ge 10) {
            Write-Host "✅ $pythonVersion - OK" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $pythonVersion - Version 3.10+ recommended" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Python not found! Install from https://python.org" -ForegroundColor Red
    $allGood = $false
}

# Check Node.js
Write-Host "`n📋 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($nodeVersion -match "v(\d+)") {
        $major = [int]$matches[1]
        if ($major -ge 18) {
            Write-Host "✅ Node.js $nodeVersion - OK" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Node.js $nodeVersion - Version 18+ recommended" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Node.js not found! Install from https://nodejs.org" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "`n📋 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "✅ npm v$npmVersion - OK" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found! (Should come with Node.js)" -ForegroundColor Red
    $allGood = $false
}

# Check Ollama
Write-Host "`n📋 Checking Ollama..." -ForegroundColor Yellow
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "✅ Ollama installed - OK" -ForegroundColor Green
    
    # Check if llama3.2 model is installed
    Write-Host "`n📋 Checking Llama 3.2 model..." -ForegroundColor Yellow
    $ollamaList = ollama list 2>&1
    if ($ollamaList -match "llama3.2") {
        Write-Host "✅ Llama 3.2 model found - OK" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Llama 3.2 model not found" -ForegroundColor Yellow
        Write-Host "   Run: ollama pull llama3.2" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Ollama not found" -ForegroundColor Yellow
    Write-Host "   Install from: https://ollama.ai" -ForegroundColor Gray
    Write-Host "   (LISA will work with fallback responses)" -ForegroundColor Gray
}

# Check Git (optional)
Write-Host "`n📋 Checking Git (optional)..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ $gitVersion - OK" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Git not found (optional for this project)" -ForegroundColor Gray
}

# Check available disk space
Write-Host "`n📋 Checking disk space..." -ForegroundColor Yellow
try {
    $drive = Get-PSDrive C
    $freeGB = [math]::Round($drive.Free / 1GB, 2)
    if ($freeGB -ge 5) {
        Write-Host "✅ ${freeGB}GB free - OK" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Only ${freeGB}GB free - 5GB+ recommended" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check disk space" -ForegroundColor Yellow
}

# Check RAM
Write-Host "`n📋 Checking system RAM..." -ForegroundColor Yellow
try {
    $ram = Get-CimInstance Win32_ComputerSystem
    $totalRAM = [math]::Round($ram.TotalPhysicalMemory / 1GB, 2)
    if ($totalRAM -ge 8) {
        Write-Host "✅ ${totalRAM}GB RAM - OK" -ForegroundColor Green
    } else {
        Write-Host "⚠️  ${totalRAM}GB RAM - 8GB+ recommended for Ollama" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check RAM" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + ("="*60) -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ All essential requirements met!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Run setup.ps1 to install dependencies" -ForegroundColor White
    Write-Host "   .\setup.ps1" -ForegroundColor Gray
    Write-Host "`n2. Or manually start the backend:" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   python -m venv venv" -ForegroundColor Gray
    Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "   pip install -r requirements.txt" -ForegroundColor Gray
    Write-Host "   python main.py" -ForegroundColor Gray
    Write-Host "`n3. Then start the frontend (new terminal):" -ForegroundColor White
    Write-Host "   cd frontend" -ForegroundColor Gray
    Write-Host "   npm install" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Some requirements are missing" -ForegroundColor Yellow
    Write-Host "`nPlease install:" -ForegroundColor Cyan
    Write-Host "- Python 3.10+: https://python.org" -ForegroundColor White
    Write-Host "- Node.js 18+: https://nodejs.org" -ForegroundColor White
    Write-Host "- Ollama: https://ollama.ai (optional but recommended)" -ForegroundColor White
}

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "- README.md - Project overview" -ForegroundColor White
Write-Host "- QUICK_START.md - Quick reference guide" -ForegroundColor White
Write-Host "- TESTING_GUIDE.md - Detailed testing instructions" -ForegroundColor White
Write-Host "- PRESENTATION_GUIDE.md - Competition presentation tips" -ForegroundColor White

Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host ""
