$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.13.3/podman-desktop-1.13.3-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '7f9fdc7c813f3e54bbba474b26b3a447cb348dc0bae585cf55641d849293a387'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
