$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/podman-desktop/podman-desktop/releases/download/v1.30.5/podman-desktop-1.30.5-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '2ede9346c2157d0a7955ea3232753449f4ef589cfdccaa11e0d915c5da532aa9'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
