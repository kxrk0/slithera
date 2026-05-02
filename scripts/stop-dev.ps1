$ErrorActionPreference = "Continue"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$projectRootAlt = $projectRoot -replace "\\", "/"
$ports = @(5173, 8787)
$targetPids = New-Object System.Collections.Generic.HashSet[int]

foreach ($port in $ports) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($connection in $connections) {
    [void]$targetPids.Add([int]$connection.OwningProcess)
  }
}

$nodeProcesses = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue
foreach ($process in $nodeProcesses) {
  $commandLine = [string]$process.CommandLine
  if ([string]::IsNullOrWhiteSpace($commandLine)) {
    continue
  }

  $isThisProject = $commandLine.Contains($projectRoot) -or $commandLine.Contains($projectRootAlt)
  if (-not $isThisProject) {
    continue
  }

  $isSlitheraDevProcess =
    ($commandLine.Contains("npm-cli.js") -and ($commandLine.Contains(" run dev") -or $commandLine.Contains(" run dev:server") -or $commandLine.Contains(" run dev:client"))) -or
    $commandLine.Contains("concurrently") -or
    ($commandLine.Contains("tsx") -and $commandLine.Contains("server/index.ts")) -or
    ($commandLine.Contains("vite") -and $commandLine.Contains("--host 0.0.0.0")) -or
    ($commandLine.Contains("dist-server") -and $commandLine.Contains("server/index.js"))

  if ($isSlitheraDevProcess) {
    [void]$targetPids.Add([int]$process.ProcessId)
  }
}

if ($targetPids.Count -eq 0) {
  Write-Host "No Slithera dev Node processes found."
} else {
  foreach ($processId in ($targetPids | Sort-Object -Descending)) {
    try {
      Stop-Process -Id $processId -Force -ErrorAction Stop
      Write-Host "Stopped Slithera Node process pid=$processId"
    } catch {
      Write-Host "Could not stop pid=$processId ($($_.Exception.Message))"
    }
  }
}

Start-Sleep -Milliseconds 450
foreach ($port in $ports) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if ($connections) {
    $pids = ($connections | ForEach-Object { $_.OwningProcess }) -join ","
    Write-Host "${port}: still open (pid $pids)"
  } else {
    Write-Host "${port}: closed"
  }
}

exit 0
