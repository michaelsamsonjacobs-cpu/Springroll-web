# setup-ollama.ps1

$ErrorActionPreference = "Stop"

$source = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"
$destDir = "src-tauri\binaries"
$targetName = "ollama-x86_64-pc-windows-msvc.exe"
$dest = Join-Path $destDir $targetName

Write-Host "Checking for Ollama installation..."

if (Test-Path $source) {
    Write-Host "Found Ollama at $source"
    
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir | Out-Null
    }

    Copy-Item -Path $source -Destination $dest -Force
    Write-Host "SUCCESS: Bundled Ollama binary to $dest"
} else {
    Write-Error "Ollama not found at $source. Please install Ollama first (https://ollama.com) or copy ollama.exe manually to src-tauri/binaries/$targetName"
}
