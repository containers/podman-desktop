$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.10.2/podman-desktop-1.10.2-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '43bbca67b8d9fa950272d81022f4ebd952ff4301f4b44ae7f15c9ee112308b27'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
