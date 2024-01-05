$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.6.4/podman-desktop-1.6.4-setup.exe'
  checksumType   = 'sha256'
  checksum64     = 'aa43a51dad17eb27006f6071490c9fada3768079b5028ba360e9647bddd53891'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
