$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.4.0/podman-desktop-1.4.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '763dcef01a2a4905a928919655db4907bbcd18d430f8b91e19d6383656acacbb'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
