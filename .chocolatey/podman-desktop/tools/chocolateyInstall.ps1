$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.0.0/podman-desktop-1.0.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = 'ff3866d3e864305e510c162dded5a51ef62c6eda3b66581a1cff2eb1aeec535a'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
