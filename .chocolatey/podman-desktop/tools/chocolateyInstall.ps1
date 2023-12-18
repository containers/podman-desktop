$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.6.3/podman-desktop-1.6.3-setup.exe'
  checksumType   = 'sha256'
  checksum64     = 'e064e51849b83a70c2068c4830f9d975baf757890d13862f00abfe1d72f7ccea'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
