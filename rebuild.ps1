# Structura 重建脚本 - PowerShell 版本

# 保存原始编码设置
$OriginalOutputEncoding = [Console]::OutputEncoding
$OriginalPSOutputEncoding = $OutputEncoding

# 设置控制台编码为UTF-8以正确显示中文
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 停止并删除现有容器
Write-Host "停止并删除现有容器..." -ForegroundColor Yellow
docker stop structura-web 2>$null
docker rm structura-web 2>$null

# 生成 themes 目录的 index.json
Write-Host "生成 themes/index.json..." -ForegroundColor Green
$themesPath = "themes"
$themesFiles = Get-ChildItem -Path $themesPath -Filter "*.css" | Select-Object -ExpandProperty Name
$themesJson = @{
    files = $themesFiles
    type = "css"
    description = "主题样式文件"
} | ConvertTo-Json -Depth 3
$themesJson | Out-File -FilePath "$themesPath/index.json" -Encoding UTF8

Write-Host "发现 $($themesFiles.Count) 个主题文件: $($themesFiles -join ', ')" -ForegroundColor Cyan

# 生成 templates 目录的 index.json
Write-Host "生成 templates/index.json..." -ForegroundColor Green
$templatesPath = "templates"
$templatesFiles = Get-ChildItem -Path $templatesPath -Filter "*.js" | Select-Object -ExpandProperty Name
$templatesJson = @{
    files = $templatesFiles
    type = "js"
    description = "模板文件"
} | ConvertTo-Json -Depth 3
$templatesJson | Out-File -FilePath "$templatesPath/index.json" -Encoding UTF8

Write-Host "发现 $($templatesFiles.Count) 个模板文件: $($templatesFiles -join ', ')" -ForegroundColor Cyan

# 构建 Docker 镜像
Write-Host "构建 Docker 镜像..." -ForegroundColor Yellow
docker build -t structura-web .

# 运行容器
Write-Host "启动容器..." -ForegroundColor Yellow
docker run -d -p 8635:80 --name structura-web structura-web

Write-Host "重建完成！应用已在 http://localhost:8635 启动" -ForegroundColor Green

# 恢复原始编码设置
[Console]::OutputEncoding = $OriginalOutputEncoding
$OutputEncoding = $OriginalPSOutputEncoding