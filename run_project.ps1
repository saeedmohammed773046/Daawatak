# Script to start all Daawatak development servers automatically in separate windows

Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "   DAAWATAK (دعوتك) QUICK START SCRIPT" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "Booting up Laravel API, WebSockets (Reverb), Queue Worker, Next.js Dashboard..." -ForegroundColor Green

# 1. Start Laravel Serve
Write-Host "Starting Laravel API Server on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\Project\backend; `$host.UI.RawUI.WindowTitle = 'Laravel API Serve'; php artisan serve" -WindowStyle Normal
Start-Sleep -Milliseconds 800

# 2. Start Laravel Reverb WebSockets
Write-Host "Starting Laravel Reverb WebSockets on port 8080..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\Project\backend; `$host.UI.RawUI.WindowTitle = 'Laravel Reverb WebSockets'; php artisan reverb:start" -WindowStyle Normal
Start-Sleep -Milliseconds 800

# 3. Start Laravel Queue Worker
Write-Host "Starting Queue Worker (generating invitations)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\Project\backend; `$host.UI.RawUI.WindowTitle = 'Laravel Queue Worker'; php artisan queue:work" -WindowStyle Normal
Start-Sleep -Milliseconds 800

# 4. Start React + Vite Frontend Dashboard Server
Write-Host "Starting Daawatak Web Platform on http://localhost:3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\Project\frontend; `$host.UI.RawUI.WindowTitle = 'Daawatak Web Platform'; npm run dev" -WindowStyle Normal
Start-Sleep -Milliseconds 800

# 5. Open Flutter Mobile directory prompt
Write-Host "Opening Flutter Mobile application directory..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\Project\Flutter; `$host.UI.RawUI.WindowTitle = 'Flutter Mobile App'; Write-Host 'To run the receptionist app on your emulator or connected device, execute: flutter run' -ForegroundColor Yellow" -WindowStyle Normal

Write-Host "All processes started in separate windows successfully!" -ForegroundColor Green
Write-Host "Please check the individual console windows for logs and output." -ForegroundColor Yellow
