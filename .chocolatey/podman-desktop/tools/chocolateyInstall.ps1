$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v0.0.5/podman-desktop-0.0.5-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '9e3190e43e742623e81fe49e80564ca7723ae73ca356a3623b83083d1a141a56'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
