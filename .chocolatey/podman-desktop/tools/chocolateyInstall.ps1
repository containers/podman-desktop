$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.8.0/podman-desktop-1.8.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '48129024bf01e415c2afc74407ccab7a41998beae27e76a597efdb45a0638d2a'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
