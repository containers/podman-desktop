$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.1.0/podman-desktop-1.1.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '6a4f4e693ea2441e4e8619647a848ffacbbf87b7d8bf2d1422605376890a1448'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
