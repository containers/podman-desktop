$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v0.12.0/podman-desktop-0.12.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = 'eee6eda24c7ae74eb9a22ce00707c78ff53e898726177380ebc54e9306b429f0'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
