$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.2.1/podman-desktop-1.2.1-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '3fabff89cacfa5f85033a0d9fba7b7be6e5faf18f067261fda186e28d1c077f9'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
