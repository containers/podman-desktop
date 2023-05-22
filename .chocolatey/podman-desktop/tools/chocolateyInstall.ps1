$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.0.1/podman-desktop-1.0.1-setup.exe'
  checksumType   = 'sha256'
  checksum64     = 'da26edd4f9c2a6518f4636d5594d24eec8fd683aaf198678b835fe21d876c1bd'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
