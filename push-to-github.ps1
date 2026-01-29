# MIDAS Plugin Cloud V0.1 - GitHub 푸시 스크립트
# Cursor/IDE를 닫거나 Source Control을 닫은 뒤, PowerShell에서 실행: .\push-to-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "1. Removing .git/index.lock if present..."
Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue

Write-Host "2. Unstaging .cursor (nested repo)..."
git rm -r --cached .cursor -f 2>$null

Write-Host "3. Staging all files..."
git add .

Write-Host "4. Committing..."
git commit -m "chore: initial commit - MIDAS Plugin Cloud V0.1 (Phase 1.1-1.3)"

Write-Host "5. Creating GitHub repo and pushing..."
gh repo create midas-plugin-cloud-V0.1 --public --source=. --remote=origin --push

Write-Host "Done. https://github.com/jiy2korea/midas-plugin-cloud-V0.1"
