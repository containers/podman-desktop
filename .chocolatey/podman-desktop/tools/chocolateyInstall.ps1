$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v0.9.1/podman-desktop-0.9.1-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '248500b0d04b7b9634eba44adc7489df7d66f8a6e8cb599a51e2702928122d29'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
