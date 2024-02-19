$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.7.1/podman-desktop-1.7.1-setup.exe'
  checksumType   = 'sha256'
  checksum64     = 'b6b60ed398fbdac10eee07b7c67fb66b4c3d186e52f58656cbf6ea97f520a93d'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
