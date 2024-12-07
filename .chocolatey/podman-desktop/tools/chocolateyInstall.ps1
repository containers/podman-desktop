$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/podman-desktop/podman-desktop/releases/download/v1.14.2/podman-desktop-1.14.2-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '09db2f82c04d90dec4c7dfaafa20c2d7dd69682a947f66df19ec4187e1dfaa68'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
