$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = 'podman-desktop'
  fileType       = 'exe'
  softwareName   = 'PodmanDesktop'

  url64bit       = 'https://github.com/containers/podman-desktop/releases/download/v1.14.1/podman-desktop-1.14.1-setup.exe'
  checksumType   = 'sha256'
  checksum64     = '095cbdf0ecd17d591152b733c59e4d44ba40f2643e53724f9431e214b9273c27'

  silentArgs     = '/S'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
