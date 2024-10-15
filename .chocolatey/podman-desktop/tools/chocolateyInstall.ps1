$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.13.2/podman-desktop-1.13.2-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '3cbd87507cf160a54f256ce32b1498d33820d8a6d3a61392eba0c51aadeda73c'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
