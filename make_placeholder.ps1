$b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
$bytes = [System.Convert]::FromBase64String($b64)
[System.IO.File]::WriteAllBytes("assets\images\placeholder.png", $bytes)
Write-Host "Placeholder image created"
