Release process for Podman Desktop
---

## Pre-Requisites

- Make sure everything that needs to be in the release is there
- Notify main contributors
- Check that the PR for Release Notes is almost completed by PM


## Cut a new release using the release workflow

1. Go to https://github.com/containers/podman-desktop/actions/workflows/release.yaml
1. Click on the top right drop-down menu `Run workflow`
1. Enter the name of the release. Example: `0.12.0` (do not use the v prefix like v0.12.0)
1. Specify the branch to use for the release. It's main for all major releases. For a bugfix release
1. Click on the `Run workflow` button
1. Edit the version the milestone going to https://github.com/containers/podman-desktop/milestones and select the date and then it `Close milestone`
1. Create a new milestone for the upcoming release for example `0.13.0` and click on `Create milestone`
1. Follow release process from https://github.com/containers/podman-desktop/actions/workflows/release.yaml
1. Approve PR for the upcoming version. Title looks like `chore: 📢 Bump version to 0.13.0`
1. Edit the release https://github.com/containers/podman-desktop/releases/edit/v0.12.0
1. Select previous tag like v0.11.0 and click on `Generate release notes` and the click on `Update release`

Follow-up:

## Package manager workflow

Pre-requisites:
- Ensure the release is OK (green workflow, artifacts are there https://github.com/containers/podman-desktop/releases)

#### Brew

We can publish to brew. It creates a PR to brew cask repository https://github.com/Homebrew/homebrew-cask/
1. Go to https://github.com/containers/podman-desktop/actions/workflows/publish-to-brew.yaml
1. Click on the top right drop-down `Run workflow`
1. Select the release version like `0.12.0` and click `Run workflow`

#### Winget

We can publish to Winget. It creates a PR to winget repository https://github.com/microsoft/winget-pkgs/
1. Go to https://github.com/containers/podman-desktop/actions/workflows/publish-to-brew.yaml
1. Click on the top right drop-down `Run workflow`
1. Select the release version like `0.12.0` and click `Run workflow`


#### Chocolatey

We can publish to Chocolatey. It creates a new submission at https://community.chocolatey.org/packages/podman-desktop/#versionhistory
1. Go to https://github.com/containers/podman-desktop/actions/workflows/publish-to-winget.yaml
1. Click on the top right drop-down `Run workflow`
1. Select the release version like `0.12.0` and click `Run workflow`
1. Approve the PR with title `chore: Update Chocolatey package to 0.12.0`


### Flathub

1. Fork repository https://github.com/flathub/io.podman_desktop.PodmanDesktop and clone your repository (example https://github.com/benoitf/io.podman_desktop.PodmanDesktop)
1. Edit the file io.podman_desktop.PodmanDesktop.yml
1. Replace url: https://github.com/containers/podman-desktop/archive/refs/tags/vXXX.tar.gz by the correct version
1. Update the SHA256 using for example `shasum -a 256 v0.12.0.tar.gz` command
1. Unpack the v0.12.0.tar.gz (like `tar zxf v0.12.0.tar.gz`)
1. Run the command (updating the volume mount path)
   ```sh
   podman run --rm -it -v $(pwd)/podman-desktop-0.12.0:/podman quay.io/podman-desktop/flatpak-node-generator yarn /podman/yarn.lock -o /podman/generated-sources.json
   ```
1. Copy the file `$(pwd)/podman-desktop-0.12.0/generated-sources.json` to `generated-sources.json`
1. Commit the files `generated-sources.json` and `io.podman_desktop.PodmanDesktop.yml` and create a PR to the repository with a title like `feat: bump to v0.11.0`
1. If the PR is successful, merge the PR


### Announcement

#### Release notes

1. Check the PR in podman-desktop repository and merge it (title should be like `Release Notes 0.12`)

#### Github discussions

1. Create a new announcement at https://github.com/containers/podman-desktop/discussions
1. Title : Podman Desktop v0.12.0
1. Creates from from https://github.com/containers/podman-desktop/discussions/1277

#### Create a Pod on Reddit

1. Create post in `podman` community
example: https://www.reddit.com/r/podman/comments/10moat6/a_new_version_of_podman_desktop_is_out_v0110/

We copy content from the release notes.

#### email announcement

1. Send email to devtools-team at redhat.com, Podman-Desktop at redhat.com
1. Send email to product-announce at redhat.com (high level)
1. Send email to podman-desktop at lists.podman.io (no links to Red Hat internal slack, etc.)

