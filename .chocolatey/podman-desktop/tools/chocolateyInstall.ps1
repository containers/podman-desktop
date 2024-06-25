$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.11.1/podman-desktop-1.11.1-setup.exe'
  checksumType   = 'sha256'
  checksum64     = 'c1e047d8b63ecd2b3cdd94fd5ed48b6fd43a4ae73f8af8a02e61317efb0eb235'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
