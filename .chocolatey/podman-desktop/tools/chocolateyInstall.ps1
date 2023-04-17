$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v0.14.1/podman-desktop-0.14.1-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '0b4f2a9273401045f1b42cf9d48e0a4a693857f2c83d4c4570c516df028d192e'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
