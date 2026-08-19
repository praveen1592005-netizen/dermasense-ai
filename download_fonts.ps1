# Download Inter fonts as TTF from Google Fonts
$headers = @{ "User-Agent" = "Mozilla/5.0" }

# Inter Regular
Invoke-WebRequest -Uri "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff" -Headers $headers -OutFile "fonts\Inter-Regular.ttf"

# Inter Bold  
Invoke-WebRequest -Uri "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff" -Headers $headers -OutFile "fonts\Inter-Bold.ttf"

$regular = (Get-Item "fonts\Inter-Regular.ttf").Length
$bold = (Get-Item "fonts\Inter-Bold.ttf").Length
Write-Host "Inter-Regular.ttf: $regular bytes"
Write-Host "Inter-Bold.ttf: $bold bytes"
