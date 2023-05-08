$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v0.15.0/podman-desktop-0.15.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '1e23fa6e44679ecc76adc0918d672690aff09554717b5143aeb94db678e0d918'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
