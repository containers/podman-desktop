$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v0.0.7/podman-desktop-0.0.7-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '12283aa08facb4feae8e26801713169fb6fdb8332763cdb7e1b0f84e5d26cac3'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
