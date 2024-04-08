$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.9.1/podman-desktop-1.9.1-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '48a52e661c2a4d027a922aeb58ae998d42506293b66caa6f731abc93c0776292'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
