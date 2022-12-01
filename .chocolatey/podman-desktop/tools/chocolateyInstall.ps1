$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v0.10.0/podman-desktop-0.10.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = 'effd7aba331db0d9d92867889c8f7aa9b82d5960f41c49e73d7947aaf1ccfd0d'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
