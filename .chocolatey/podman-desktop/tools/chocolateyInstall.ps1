$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/podman-desktop/podman-desktop/releases/download/v1.15.0/podman-desktop-1.15.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '17ac7a4eb1e9f9da724b0a96ab215f6f1a83465eabe86fcbfef374db234f22d5'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
