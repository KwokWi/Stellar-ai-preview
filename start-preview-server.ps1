# 启动本地预览服务器（端口 4173）
# 运行后保持窗口打开，再在 Cursor 里用 Simple Browser: Show 打开 http://localhost:4173/stars_ai_preview.html

$root = $PSScriptRoot
Set-Location $root
Write-Host "Working directory: $root" -ForegroundColor Cyan
Write-Host "Starting HTTP server on http://localhost:4173" -ForegroundColor Green
Write-Host "Open in Cursor Simple Browser: http://127.0.0.1:4173/stars_ai_preview.html (if -324, use Tasks: Run Task -> 在系统浏览器中打开)" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
python -m http.server 4173 --bind 127.0.0.1
