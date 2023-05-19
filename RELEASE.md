Release process for Podman Desktop
---

## Pre-requisites

- Make sure everything that needs to be in the release is there
- Notify main contributors
- Check that the PR for Release Notes is almost completed by PM

In the below example, we will pretend that we're upgrading from `0.11.0` to `0.12.0`.

## Cut a new release using the release workflow

1. Go to https://github.com/containers/podman-desktop/actions/workflows/release.yaml
1. Click on the top right drop-down menu `Run workflow`
1. Enter the name of the release. Example: `0.12.0` (DO NOT use the v prefix like v0.12.0)
1. Specify the branch to use for the new release. It's main for all major releases. For a bugfix release, you'll select a different branch.
1. Click on the `Run workflow` button
1. Close the milestone for the respective release, make sure that all tasks within the milesetone are completed / updated before closing. https://github.com/containers/podman-desktop/milestones
1. If not already created, create a new milestone for the upcoming release after for example `0.13.0` and click on `Create milestone`
1. Check that https://github.com/containers/podman-desktop/actions/workflows/release.yaml has been completed. Sometimes it will flake, so you may need to re-run it.
1. There should be an automated PR that has been created. Approve PR for the upcoming version. The title looks like `chore: 📢 Bump version to 0.13.0`
1. Edit the new release https://github.com/containers/podman-desktop/releases/edit/v0.12.0
1. Select previous tag (v0.11.0) and click on `Generate release notes` and the click on `Update release`

## Package manager workflow

Pre-requisites:
- Ensure the release is OK (green workflow, artifacts are there https://github.com/containers/podman-desktop/releases)

#### Brew

Publish to brew. The workflow will create an automated PR to the brew cask repository https://github.com/Homebrew/homebrew-cask/
1. Go to https://github.com/containers/podman-desktop/actions/workflows/publish-to-brew.yaml
1. Click on the top right drop-down `Run workflow`
1. Select the release (under tags), which would be `v0.12.0`
1. Enter the release version `0.12.0`. DO NOT add the `v`
1. Click `Run workflow`

You can view the PR at: https://github.com/Homebrew/homebrew-cask/pulls?q=is%3Apr+podman-desktop 


#### Winget

Publish to winget. The workflow will create an automated PR to the Winget pkgs repository https://github.com/microsoft/winget-pkgs/
1. Go to https://github.com/containers/podman-desktop/actions/workflows/publish-to-winget.yaml
1. Click on the top right drop-down `Run workflow`
1. Select the release (under tags), which would be `v0.12.0`
1. Enter the release version `0.12.0`. DO NOT add the `v`
1. Click `Run workflow`

You can view the PR at: https://github.com/microsoft/winget-pkgs/pulls?q=is%3Apr+podman-desktop

#### Chocolatey

Publish to chocolatey. The workflow will create an automatic submission to the chocolatey site at https://community.chocolatey.org/packages/podman-desktop/#versionhistory
1. Go to https://github.com/containers/podman-desktop/actions/workflows/publish-to-chocolatey.yaml
1. Click on the top right drop-down `Run workflow`
1. Select the release (under tags), which would be `v0.12.0`
1. Enter the release version `0.12.0`. DO NOT add the `v`
1. Click `Run workflow`

Afterwards, you'll have to:
* Approve the PR with title `chore: Update Chocolatey package to 0.12.0` at https://github.com/containers/podman-desktop/pulls?q=is%3Apr+Update+Chocolatey

You can view the progress at: https://community.chocolatey.org/packages/podman-desktop/0.12.0

### Flathub

1. Fork the repository https://github.com/flathub/io.podman_desktop.PodmanDesktop and clone your repository (example https://github.com/benoitf/io.podman_desktop.PodmanDesktop)
1. Edit the file: `io.podman_desktop.PodmanDesktop.yml`
1. Replace url: https://github.com/containers/podman-desktop/archive/refs/tags/vXXX.tar.gz by the correct version (`0.12.0`)
1. Download the package: `wget https://github.com/containers/podman-desktop/archive/refs/tags/v0.12.0.tar.gz`
1. Get the SHA256: `shasum -a 256 v0.12.0.tar.gz`
1. Update `io.podman_desktop.PodmanDesktop.yml` with the new SHA256.
1. Unpack the tar: `tar zxf v0.12.0.tar.gz`
1. Run the command (updating the volume mount path)
   ```sh
   podman run --rm -it -v $(pwd)/podman-desktop-0.12.0:/podman quay.io/podman-desktop/flatpak-node-generator yarn /podman/yarn.lock -o /podman/generated-sources.json
   ```
1. Copy the file `$(pwd)/podman-desktop-0.12.0/generated-sources.json` to `generated-sources.json`
1. Only commit the files:
* `generated-sources.json`
* `io.podman_desktop.PodmanDesktop.yml`
1. Create a PR to the repository with a title like `feat: bump to v0.11.0`
1. If the PR passes all tests, merge the PR

### Announcement

#### Release notes

1. Double check with the Project Manager / Technical lead that the release notes are ready
1. Merge the release notes (there should be a pending PR such as: `Release notes 0.12`)

#### Github discussions

1. Create a new announcement at https://github.com/containers/podman-desktop/discussions
1. Example template:
```
Hello,

A new release of Podman Desktop is out: [v0.11.0](https://github.com/containers/podman-desktop/milestone/12?closed=1)

Download it from the [download section](https://podman-desktop.io/downloads) of the [Podman Desktop website](https://podman-desktop.io/)

Release Notes are available at https://podman-desktop.io/blog/podman-desktop-release-0.11

Full Changelog is available at https://github.com/containers/podman-desktop/releases/tag/v0.11.0
```

#### Create a post on Reddit

An example of a previous post: https://www.reddit.com/r/podman/comments/10moat6/a_new_version_of_podman_desktop_is_out_v0110/

1. Click create post on the [Podman subreddit](https://www.reddit.com/r/podman/).
2. Title it: `A new version of Podman Desktop is out: v0.12.0`
3. Copy over release notes (markdown works on Reddit)

#### Email announcement

1. Send email to devtools-team at redhat.com, Podman-Desktop at redhat.com
1. Send email to product-announce at redhat.com (high level)
1. Send email to podman-desktop at lists.podman.io (no links to Red Hat internal slack, etc.)