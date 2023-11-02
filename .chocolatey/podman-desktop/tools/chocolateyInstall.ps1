$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.5.2/podman-desktop-1.5.2-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '8101373fdcd872d7fbc4c3dbe0b1d876d10493ce4f348aed90c56a4d2e986b0b'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
