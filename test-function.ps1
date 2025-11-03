# Test script for Firebase Cloud Function
# Run this in PowerShell

$url = "http://127.0.0.1:5001/athena-math/us-central1/chat"

$body = @{
    messages = @(
        @{
            role = "user"
            content = "How do I solve 2x + 5 = 13?"
        }
    )
    problem = "2x + 5 = 13"
} | ConvertTo-Json -Depth 10

Write-Host "Testing chat function..." -ForegroundColor Green
Write-Host "URL: $url" -ForegroundColor Cyan
Write-Host "Body: $body" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response (first 500 chars):" -ForegroundColor Cyan
    $response.Content.Substring(0, [Math]::Min(500, $response.Content.Length))
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}

