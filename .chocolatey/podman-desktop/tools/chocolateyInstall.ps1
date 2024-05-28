$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.10.3/podman-desktop-1.10.3-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '6ed4c03ea60487d1b472e53691108dcc8898f6811713be994b22375ca72c5000'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
