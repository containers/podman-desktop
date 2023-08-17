$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.3.1/podman-desktop-1.3.1-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '83ac2e51ba5baeb034dd352f470062da2b335d757022afd790e9c7cb4a2b2598'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
