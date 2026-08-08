Add-Type -AssemblyName System.Drawing
[System.Drawing.Color] | Out-Null

$size = 81
$dir = "D:\Program_work\memorybook_app\static\tabbar"

$gray = [System.Drawing.Color]::FromArgb(122, 126, 131)
$blue = [System.Drawing.Color]::FromArgb(58, 122, 254)

function New-HomeIcon($color) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $pen = New-Object System.Drawing.Pen($color, 3)
    
    # Roof triangle
    $g.DrawLine($pen, 15, 38, 40, 12)
    $g.DrawLine($pen, 40, 12, 65, 38)
    $g.DrawLine($pen, 15, 38, 65, 38)
    
    # House body
    $g.DrawRectangle($pen, 18, 38, 44, 27)
    
    # Door vertical line
    $g.DrawLine($pen, 40, 45, 40, 65)
    
    $g.Dispose()
    $pen.Dispose()
    return $bmp
}

function New-SalesIcon($color) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $pen = New-Object System.Drawing.Pen($color, 3)
    
    # Circle
    $g.DrawEllipse($pen, 15, 12, 50, 50)
    
    # Y-en symbol
    $g.DrawLine($pen, 40, 25, 40, 58)
    $g.DrawLine($pen, 28, 38, 52, 38)
    $g.DrawLine($pen, 28, 48, 52, 48)
    
    $g.Dispose()
    $pen.Dispose()
    return $bmp
}

function New-PurchaseIcon($color) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $pen = New-Object System.Drawing.Pen($color, 3)
    
    # Box top
    $g.DrawLine($pen, 12, 30, 40, 15)
    $g.DrawLine($pen, 40, 15, 68, 30)
    $g.DrawLine($pen, 12, 30, 68, 30)
    
    # Box body
    $g.DrawRectangle($pen, 12, 30, 56, 38)
    
    # Center vertical
    $g.DrawLine($pen, 40, 15, 40, 68)
    
    $g.Dispose()
    $pen.Dispose()
    return $bmp
}

function New-InventoryIcon($color) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $pen = New-Object System.Drawing.Pen($color, 3)
    $brush = New-Object System.Drawing.SolidBrush($color)
    
    # Three shelves
    $g.DrawRectangle($pen, 12, 12, 56, 16)
    $g.DrawRectangle($pen, 12, 34, 56, 16)
    $g.DrawRectangle($pen, 12, 56, 56, 14)
    
    # Dots
    $g.FillEllipse($brush, 18, 18, 4, 4)
    $g.FillEllipse($brush, 18, 40, 4, 4)
    $g.FillEllipse($brush, 18, 62, 4, 4)
    
    $g.Dispose()
    $pen.Dispose()
    $brush.Dispose()
    return $bmp
}

$items = @(
    @{fn="New-HomeIcon"; name="home"; color=$gray},
    @{fn="New-HomeIcon"; name="home-active"; color=$blue},
    @{fn="New-SalesIcon"; name="sales"; color=$gray},
    @{fn="New-SalesIcon"; name="sales-active"; color=$blue},
    @{fn="New-PurchaseIcon"; name="purchase"; color=$gray},
    @{fn="New-PurchaseIcon"; name="purchase-active"; color=$blue},
    @{fn="New-InventoryIcon"; name="inventory"; color=$gray},
    @{fn="New-InventoryIcon"; name="inventory-active"; color=$blue}
)

foreach ($item in $items) {
    $bmp = & $item.fn $item.color
    $path = Join-Path $dir "$($item.name).png"
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created: $($item.name).png"
}

Write-Host "Done!"
