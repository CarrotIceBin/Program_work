Add-Type -AssemblyName System.Drawing

$dir = "D:\Program_work\memorybook_app\static"

function New-AppLogo($size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Background gradient (rounded square via path)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $radius = [int]($size * 0.2)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $diameter = $radius * 2
    
    $path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
    $path.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
    $path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect, [System.Drawing.Color]::FromArgb(58,122,254), [System.Drawing.Color]::FromArgb(91,155,255), 45)
    $g.FillPath($brush, $path)
    $brush.Dispose()
    
    # Scale factor based on 512 reference
    $s = $size / 512.0
    
    # Refrigerator icon
    $white = [System.Drawing.Color]::White
    $blue = [System.Drawing.Color]::FromArgb(58,122,254)
    
    # Fridge body
    $fridgeX = [int](80 * $s)
    $fridgeY = [int](70 * $s)
    $fridgeW = [int](120 * $s)
    $fridgeH = [int](180 * $s)
    $fridgeR = [int](10 * $s)
    
    $g.FillRectangle((New-Object System.Drawing.SolidBrush($white)), $fridgeX, $fridgeY, $fridgeW, [int](55 * $s))
    $g.FillRectangle((New-Object System.Drawing.SolidBrush($white)), $fridgeX, $fridgeY + [int](60 * $s), $fridgeW, $fridgeH - [int](60 * $s))
    $g.FillRectangle((New-Object System.Drawing.SolidBrush($white)), $fridgeX + $fridgeW - [int](10*$s), $fridgeY, [int](10*$s), $fridgeH)
    
    # Fridge divider
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(58,122,254), [max]1, [int](3 * $s))
    $g.DrawLine($pen, $fridgeX, $fridgeY + [int](60 * $s), $fridgeX + $fridgeW, $fridgeY + [int](60 * $s))
    $pen.Dispose()
    
    # Fridge handle circles
    $handleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(58,122,254))
    $g.FillEllipse($handleBrush, $fridgeX + $fridgeW - [int](16*$s), $fridgeY + [int](20*$s), [int](10*$s), [int](10*$s))
    $g.FillEllipse($handleBrush, $fridgeX + $fridgeW - [int](16*$s), $fridgeY + [int](110*$s), [int](10*$s), [int](10*$s))
    $handleBrush.Dispose()
    
    # Coin circle
    $coinBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Rectangle([int](260*$s), [int](160*$s), [int](120*$s), [int](120*$s))),
        [System.Drawing.Color]::FromArgb(255,217,61), [System.Drawing.Color]::FromArgb(255,184,0), 45)
    $g.FillEllipse($coinBrush, [int](260*$s), [int](160*$s), [int](120*$s), [int](120*$s))
    $coinBrush.Dispose()
    
    # Yen symbol on coin
    $yenPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(184,134,11), [max]2, [int](5*$s))
    $yCenterX = [int](260*$s) + [int](60*$s)
    $yCenterY = [int](160*$s) + [int](60*$s)
    $g.DrawLine($yenPen, $yCenterX, $yCenterY - [int](25*$s), $yCenterX, $yCenterY + [int](25*$s))
    $g.DrawLine($yenPen, $yCenterX - [int](20*$s), $yCenterY - [int](5*$s), $yCenterX + [int](20*$s), $yCenterY - [int](5*$s))
    $g.DrawLine($yenPen, $yCenterX - [int](20*$s), $yCenterY + [int](10*$s), $yCenterX + [int](20*$s), $yCenterY + [int](10*$s))
    $yenPen.Dispose()
    
    # Box icon
    $boxX = [int](340 * $s)
    $boxY = [int](320 * $s)
    $boxW = [int](110 * $s)
    $boxH = [int](80 * $s)
    $boxBrush = New-Object System.Drawing.SolidBrush($white)
    $g.FillRectangle($boxBrush, $boxX, $boxY + [int](10*$s), $boxW, $boxH)
    # Box top triangle (trapezoid)
    $topPoints = [System.Drawing.Point[]]@(
        (New-Object System.Drawing.Point($boxX, $boxY + [int](10*$s))),
        (New-Object System.Drawing.Point($boxX + [int](55*$s), $boxY)),
        (New-Object System.Drawing.Point($boxX + $boxW, $boxY + [int](10*$s)))
    )
    $g.FillPolygon($boxBrush, $topPoints)
    
    # Box cross lines
    $boxPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(58,122,254), [max]1, [int](2*$s))
    $g.DrawLine($boxPen, $boxX + [int](55*$s), $boxY, $boxX + [int](55*$s), $boxY + $boxH + [int](10*$s))
    $g.DrawLine($boxPen, $boxX, $boxY + [int](30*$s), $boxX + $boxW, $boxY + [int](30*$s))
    $boxPen.Dispose()
    $boxBrush.Dispose()
    
    # Plus circle
    $plusBrush = New-Object System.Drawing.SolidBrush($white)
    $plusX = [int](120 * $s)
    $plusY = [int](330 * $s)
    $plusR = [int](25 * $s)
    $g.FillEllipse($plusBrush, $plusX, $plusY, $plusR * 2, $plusR * 2)
    $plusPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(58,122,254), [max]2, [int](5*$s))
    $g.DrawLine($plusPen, $plusX + $plusR, $plusY + [int](12*$s), $plusX + $plusR, $plusY + [int](38*$s))
    $g.DrawLine($plusPen, $plusX + [int](12*$s), $plusY + $plusR, $plusX + [int](38*$s), $plusY + $plusR)
    $plusPen.Dispose()
    $plusBrush.Dispose()
    
    $g.Dispose()
    $path.Dispose()
    return $bmp
}

$sizes = @(
    @{size=192; name="app-logo-192.png"},
    @{size=144; name="app-logo-144.png"},
    @{size=96; name="app-logo-96.png"},
    @{size=72; name="app-logo-72.png"},
    @{size=48; name="app-logo-48.png"}
)

foreach ($item in $sizes) {
    $bmp = New-AppLogo $item.size
    $path = Join-Path $dir $item.name
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created: $($item.name) ($($item.size)x$($item.size))"
}

Write-Host "Done!"
