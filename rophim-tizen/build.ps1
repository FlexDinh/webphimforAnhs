# Script đóng gói RoPhim Tizen Widget (.wgt)
# File .wgt thực chất là file ZIP đổi đuôi

$projectDir = $PSScriptRoot
$outputFile = Join-Path $projectDir "RoPhim-TV.wgt"

# Xóa file cũ nếu có
if (Test-Path $outputFile) {
    Remove-Item $outputFile -Force
}

# Tạo file ZIP từ các file cần thiết
$filesToInclude = @(
    "config.xml",
    "index.html",
    "icon.png"
)

# Tạo thư mục tạm
$tempDir = Join-Path $projectDir "_build_temp"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy files vào thư mục tạm
foreach ($file in $filesToInclude) {
    $src = Join-Path $projectDir $file
    if (Test-Path $src) {
        Copy-Item $src (Join-Path $tempDir $file)
        Write-Host "  + $file" -ForegroundColor Green
    } else {
        Write-Host "  ! Missing: $file" -ForegroundColor Red
    }
}

# Nén thành ZIP
$zipFile = Join-Path $projectDir "RoPhim-TV.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }

Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $zipFile -Force

# Đổi đuôi thành .wgt
Move-Item $zipFile $outputFile -Force

# Dọn dẹp
Remove-Item $tempDir -Recurse -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RoPhim-TV.wgt da duoc tao thanh cong!" -ForegroundColor Green
Write-Host "  File: $outputFile" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cach cai len TV Samsung:" -ForegroundColor White
Write-Host "1. Cai Tizen Studio: https://developer.tizen.org/development/tizen-studio/download" -ForegroundColor Gray
Write-Host "2. Bat Developer Mode tren TV (Apps > nhan 12345 tren remote)" -ForegroundColor Gray
Write-Host "3. Ket noi TV: sdb connect <IP_TV>:26101" -ForegroundColor Gray
Write-Host "4. Cai app:   sdb install RoPhim-TV.wgt" -ForegroundColor Gray
Write-Host ""
