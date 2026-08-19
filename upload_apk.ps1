Add-Type -AssemblyName System.Net.Http

$apkPath = Resolve-Path "build\app\outputs\flutter-apk\app-release.apk"

Write-Host "Getting best GoFile server..."
$serverResp = Invoke-RestMethod -Uri "https://api.gofile.io/servers" -Method GET
$server = $serverResp.data.servers[0].name
Write-Host "Using server: $server"

$uploadUri = "https://$server.gofile.io/contents/uploadfile"
Write-Host "Uploading APK ($([math]::Round((Get-Item $apkPath).Length / 1MB, 1)) MB) to $uploadUri ..."

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    $handler = New-Object System.Net.Http.HttpClientHandler
    $client  = New-Object System.Net.Http.HttpClient($handler)
    $client.Timeout = [TimeSpan]::FromMinutes(10)

    $content = New-Object System.Net.Http.MultipartFormDataContent
    $fileStream = [System.IO.File]::OpenRead($apkPath)
    $streamContent = New-Object System.Net.Http.StreamContent($fileStream)
    $streamContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("application/octet-stream")
    $content.Add($streamContent, "file", "DermaSense-AI.apk")

    Write-Host "Sending request..."
    $response = $client.PostAsync($uploadUri, $content).Result
    $body = $response.Content.ReadAsStringAsync().Result
    Write-Host "Response: $body"

    $json = $body | ConvertFrom-Json
    if ($json.status -eq "ok") {
        Write-Host ""
        Write-Host "========================================="
        Write-Host "APK DOWNLOAD LINK:"
        Write-Host "https://gofile.io/d/$($json.data.code)"
        Write-Host "========================================="
    }

    $fileStream.Close()
    $client.Dispose()
} catch {
    Write-Host "Error: $_"
}
