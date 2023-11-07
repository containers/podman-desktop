$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.5.3/podman-desktop-1.5.3-setup.exe'
  checksumType   = 'sha256'
  checksum64     = 'd721468768e4638f1c2f9a22ce7f7ddd48d43f39891ac5e5a52d893bdbdc6cc2'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
