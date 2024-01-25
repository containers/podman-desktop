$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.7.0/podman-desktop-1.7.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '6c80b89f4f827e32d9def1c9078b3de276e47aed9d413b2a388230f91b5542f1'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
