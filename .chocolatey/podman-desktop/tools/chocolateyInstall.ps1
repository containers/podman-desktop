$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.2.0/podman-desktop-1.2.0-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '68673c8d1cd943bdde6e81ee49d448c3f8570fa68ff0f6b4a4d87ee9b5351857'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
