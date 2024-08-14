$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.12.0/podman-desktop-1.12.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '343b84cd95ce32e58c274b5b567d47d3ec12b69050775b7630881a01d3e80428'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
