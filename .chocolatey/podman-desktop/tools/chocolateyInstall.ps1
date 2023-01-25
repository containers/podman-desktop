$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v0.11.0/podman-desktop-0.11.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '9570b3d3a5fb4687bb1bd19b3deca9d38e0c6df56d42737e054c2fc67f12f791'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
