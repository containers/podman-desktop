$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v0.13.0/podman-desktop-0.13.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '310a1358a2da6905994c7013391fd292f05bbd46279260af025114edfd7ebe11'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
