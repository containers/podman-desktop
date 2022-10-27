import-module au

$version = $env:VERSION
$releases = 'https://github.com/containers/podman-desktop/releases/expanded_assets/v' + $version

function global:au_SearchReplace {
   @{
        ".\tools\chocolateyInstall.ps1" = @{
            "(?i)(^\s*url64bit\s*=\s*)('.*')"   = "`$1'$($Latest.URL64)'"
            "(?i)(^\s*checksum64\s*=\s*)('.*')" = "`$1'$($Latest.Checksum64)'"
        }
        ".\podman-desktop.nuspec" = @{
            "\<version\>.+" = "<version>$($Latest.Version)</version>"
            "\<releaseNotes\>.+" = "<releaseNotes>$($Latest.ReleaseNotes)</releaseNotes>"
    }
    }
}

function global:au_GetLatest {
    $download_page = Invoke-WebRequest -Uri $releases

    $url64   = $download_page.links | ? href -match '-setup.exe$' | % href | select -First 1
    $version = (Split-Path ( Split-Path $url64 ) -Leaf).Substring(1)

    @{
        URL64   = 'https://github.com' + $url64
        Version = $version
        ReleaseNotes = $releases
    }
}

update -ChecksumFor 64
