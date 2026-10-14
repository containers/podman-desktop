# Release process for Podman Desktop

## Pre-requisites

- Create Task issue `Release vX.X.X` for the current sprint (if such an issue does not already exist), then update the type to Release and assign it to yourself.
- Confirm with Podman Desktop maintainers that pending / need-to-go-in PR's have been merged.
- Notify main contributors on Discord / Slack.
- Release notes for the blog: Communicate with the person who has been tasked with creating the documentation. If you are assigned, see the below ["Documentation"](#documentation) section.

In the below example, we will pretend that we're upgrading from `0.11.0` to `0.12.0`. Please use the CORRECT release numbers as these are just example numbers.

## Release timeline

Below is what a typical release week may look like (This is just an example of timeline, some tasks may require extra days to complete):

- **Monday (Notify):** 48-hour notification. Communicate to maintainers and public channels a release will be cut on Wednesday and to merge any pending PRs. Inform QE team. Start work on blog post as it is usually the longest part of the release process.
- **Tuesday (Staging, Testing & Blog):** Stage the release (see instructions below) to create a new cut of the release to test. Test the pre-release (master branch) build briefly. Get feedback from committers (if applicable). Push the blog post for review (as it usually takes a few back-and-forth reviews on documentation).
- **Wednesday (Release):** Cut the new release using the below release process. The release will take 24 hours for release to hit all release channels (Flatpak, Brew, Chocolatey, etc.). We aim to have a release out _by Thursday_ so we do not have any surprises leading into the weekend.
- **Thursday (Post-release Testing & Blog):** Test the post-release build briefly for any critical bugs. Confirm that new release has been pushed to all release channels. Push the blog post live. Get a known issues list together from QE and publish to the Podman Desktop Discussions, link to this from the release notes.
- **Friday (Communicate):** Friday is statistically the best day for new announcements. Post on internal channels. Post on reddit, hackernews, twitter, etc.

## Releasing on GitHub

1. Go to https://github.com/containers/podman-desktop/actions/workflows/release.yaml
1. Click on the top right drop-down menu `Run workflow`
1. Enter the name of the release. Example: `0.12.0` (DO NOT use the v prefix like v0.12.0)
1. Specify the branch to use for the new release. It's main for all major releases. For a bugfix release, you'll select a different branch.
1. Click on the `Run workflow` button.
1. Note: `Run workflow` takes approximately 30-50 minutes. Brew a coffee, work on the release notes, and/or complete the next two steps while you wait.
1. Close the milestone for the respective release, make sure that all tasks within the milestone are completed / updated before closing. https://github.com/containers/podman-desktop/milestones
1. If not already created, click on `New Milestone` and create a new milestone for the NEXT release.
1. Check that https://github.com/containers/podman-desktop/actions/workflows/release.yaml has been completed. Sometimes it will flake, so you may need to re-run it.
1. There should be an automated PR that has been created. Approve this and set to auto-merge. This will be automatically merged in after all tests have been ran (takes 10-30 minutes). The title looks like `chore: 📢 Bump version to 0.13.0`. Rerun workflow manually if some of e2e tests are failing.
1. Above PR MUST be merged before continuing with the steps.
1. Edit the new release https://github.com/containers/podman-desktop/releases/edit/v0.12.0
1. Select previous tag (v0.11.0) and click on `Generate release notes` and then click on `Update release`
1. 🚨 Create the flathub PR once the release is available. This allows users / QE to test the new version. **IMPORTANT NOTE:** We will hold the merge until it is approved.

   This PR can be created by doing the following:
   - Go to https://github.com/containers/podman-desktop/actions/workflows/publish-flathub.yaml
   - Click on the top right drop-down `Run workflow`
   - Enter the release version `0.12.0` for example. DO NOT add the `v`
   - Click `Run workflow`
   - You can view the PR at: https://github.com/flathub/io.podman_desktop.PodmanDesktop/pulls/podman-desktop-bot

1. Approve `npmjs-publish.yaml` workflow **IMPORTANT NOTE:** We should wait for release note to be merged

   The workflow will be waiting for manual approval
   - Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/npmjs-publish.yaml?query=is%3Awaiting
   - Click on `View details` of the run corresponding to the release you wish to publish
   - Click on `Review Deployment`
   - Check `npmjs-publish.yaml` then click on `Approve and Deploy`
   - Cancel any other pending run (If you did one or several re-spin, previous release tag will also wait, we should not publish them).

1. Approve `schemastore-sync-extension-schema.yaml` workflow

   The workflow will be waiting for manual approval
   - Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/schemastore-sync-extension-schema.yaml?query=is%3Awaiting
   - Click on `View details` of the run corresponding to the release you wish to sync
   - Click on `Review Deployment`
   - Check `schemastore-sync-extension-schema.yaml` then click on `Approve and Deploy`
   - Cancel any other pending run (If you did one or several re-spin, previous release tag will also wait, we should not sync them).

## Test release before it is rolling out.

The release is a **pre-release**, it means it is not yet the latest version, so no clients will automatically update to this version.

Inform QE the **pre-release** is out! It allows QE (and everyone else) to download and test these binaries before they go live or are in the package managers.

The release may be tested using the assets generated within the pre-release.

## QE and cherry picking fixes

- ❌ All critical bugs and regressions reported by QE are investigated and reviewed. If we determine that any of these issues warrant blocking the release, the necessary fixes will be implemented, and a new release candidate will be created—incrementing the patch version (e.g., 0.12.1 instead of 0.12.0).

**Cherry picking:**

If there are fixes that need to be made to the release as brought up by QE the following steps need to be completed (using hypothetical release 0.12.0 as an example):

1. Create the cherry-fix branch `0.12.x` from tag `0.12.0`:

```sh
$ git fetch --tags
$ git checkout -b 0.12.x v0.12.0
$ git push origin 0.12.x
```

2. Create PRs with the fixes that merge into `main` and use Mergify to open backport PRs to `0.12.x` by adding the following comment in the main PRs: `@Mergifyio backport 0.12.x`
3. Make sure all PRs are merged, before re-spinning a release.

**Re-spin a release:**

You'll need to create another release from the 0.12.x branch. This can be done by doing the following:

1. Go to `Run workflow` in the [release steps](/RELEASE.md#releasing-on-github) again.
2. **MAKE SURE** you specify that you want to use the `0.12.x` branch, NOT `main` under `Branch to use for the release`.
3. Version to release should be `0.12.1` **IMPORTANT NOTE:** Literally `0.12.1` NOT the branch name `0.12.x`.

## Testing sign-off

Before promoting a pre-release to latest, wait for official sign-off.

**Notification:** After testing is done, designated release owner will be tagged on Slack in a message that includes one of two explicit status lines:

- `QE is approving the release of <version>` - **GO:** Proceed with the remaining release steps.
- `QE is not approving the release of <version>` - **NO-GO:** Hold the release until blockers are resolved.

**Bug details:** The message includes a direct link to the GitHub testing issue. Review the comment on that issue for the full list of discovered bugs, test results, and details.

Do not proceed with promotion until an approval message is posted.

## Change from pre-release to release

✅ After [Testing sign-off](#testing-sign-off), we have a green light!

1. Ensure release notes PR is ready
1. Merge the release notes before flagging the release as the 'latest': It is because Podman Desktop is displaying in the UI the release notes of the new release, so as soon as there is an update, the data needs to be there.

**DO NOT FORGET to change from pre-release to release!**

This is done on your release URL

**Do not forget to change the release from 'pre-release' to 'latest release' before proceeding**.

1.  Go to your release: https://github.com/containers/podman-desktop/releases/tag/vX.X.X
2.  Press the edit button.
3.  Uncheck `Set as a pre-release`

**IMPORTANT NOTE:** Only the .z version that was approved by QE should be changed from pre-release to release. Any previous blocked versions need to stay as pre-release. For example, if the respin version `0.12.1` was approved by QE after finding bugs in `0.12.0`, only `0.12.1` should be moved from pre-release to release.

## Updating package managers (Brew, Winget, Chocolatey, Flathub)

Pre-requisites:

- Ensure the release is OK (green workflow, artifacts are there https://github.com/containers/podman-desktop/releases).

### Flathub

PR was created during the release, but it was not yet merged.
The link to the PR is at https://github.com/flathub/io.podman_desktop.PodmanDesktop/pulls/podman-desktop-bot

1. once the PR passes all tests and release is accepted, merge the PR

#### Brew

⏭️ Brew bot automation handles the update on the Brew side. No manual action is necessary.

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
1. Run the workflow from the main branch.
1. Enter the release version `0.12.0`. DO NOT add the `v`
1. Click `Run workflow`

Afterwards, you'll have to:

- Approve the PR with title `chore: Update Chocolatey package to 0.12.0` at https://github.com/containers/podman-desktop/pulls?q=is%3Apr+Update+Chocolatey

You can view the progress at: https://community.chocolatey.org/packages/podman-desktop/0.12.0

## Documentation

### Release notes

You can generate release notes by using the [release notes tool](https://github.com/podman-desktop/tool-release-notes). This will go through each PR that is linked with the given milestone and automatically generate release notes.

> **_NOTE:_** If the issue is not in given milestone it will not be in release notes. The release notes are generated locally on your machine, you just need to add the images with editing the highlighted PRs (since those can be generated by AI model). And copy the release notes to right folder in podman-desktop repository.

OR

1. Use an [example template](#release-notes-template) for the release notes.
1. Create a PR to the blog folder of the website using the file format: `website/blog/2023-07-12-release-0.13.md`
1. Example of request when using `gh` cli tool for 1.9.0 milestone: `gh pr list --limit 300 --repo "containers/podman-desktop" --search "state:closed milestone:1.9.0" --json title,number,url --template '{{range .}}- {{.title}} [#{{.number}}]({{.url}}){{"\n"}}{{end}}'`
1. Add any images to the `website/img/podman-desktop-release-0.13` folder.
1. Ping the respective docs maintainers for a review before merging.

### Updating the podman.io website

The below workflow will create a PR for the Podman [website](https://podman.io) by updating the version number.

1. Go to https://github.com/containers/podman-desktop/actions/workflows/publish-to-podman_io.yaml
1. Click on the top right drop-down `Run workflow`
1. Select the release (under tags), which would be `v0.12.0`
1. Enter the release version `0.12.0`. DO NOT add the `v`
1. Click `Run workflow`
1. Check that the PR has been created after the workflow at https://github.com/containers/podman.io/pull/

## Announcements

#### Release notes

1. Double check with the Project Manager / Technical lead that the release notes are ready
1. Merge the release notes (there should be a pending PR such as: `Release notes 0.12`), this will now be published on the blog.

#### Github discussions

1. Create a new announcement at https://github.com/containers/podman-desktop/discussions
1. Example template:

```
Hello,

A new release of Podman Desktop is out: [v0.12.0](https://github.com/containers/podman-desktop/milestone/12?closed=1)

Download it from the [download section](https://podman-desktop.io/downloads) of the [Podman Desktop website](https://podman-desktop.io/)

Release Notes are available at https://podman-desktop.io/blog/podman-desktop-release-0.12

Full Changelog is available at https://github.com/containers/podman-desktop/releases/tag/v0.12.0
```

#### Create a post on Reddit

An example of a previous post: https://www.reddit.com/r/podman/comments/10moat6/a_new_version_of_podman_desktop_is_out_v0110/

1. Click create post on the [Podman Desktop subreddit](https://www.reddit.com/r/podmandesktop/).
2. Title it: `A new version of Podman Desktop is out: v0.12.0`
3. Copy over release notes (markdown works on Reddit)

#### Email announcement

1. Send email to devtools-team at redhat.com, Podman-Desktop at redhat.com
1. Check in with the Product Manager (PM) about the product-announce announcement (high level)
1. Send email to podman-desktop at lists.podman.io (no links to Red Hat internal slack, etc.)

## Release notes template

```
---
title: Release Notes - Podman Desktop X.X
description: Podman Desktop X.X has been released!
slug: podman-desktop-release-X.X
authors: [YOURUSERNAME]
tags: [podman-desktop, release, kubernetes, openshift]
hide_table_of_contents: false
<!-- This image link is used for social media previews / thumbnails. Release images are available: https://github.com/containers/podman-desktop-internal/tree/main/release-images -->
image: /img/blog/podman-desktop-release-1.X/X.png
---

<!-- ADD IMPORT REACTPLAYER IF USING VIDEO -->
<!-- import ReactPlayer from 'react-player' -->
<!-- EXAMPLE -->
<!-- <ReactPlayer playing playsinline controls url="https://user-images.githubusercontent.com/436777/241246481-305d215f-2a5c-46e8-9cc3-ecd90a6bd2bc.mp4" /> -->

Podman Desktop X.X Release! 🎉

<!-- DESCRIBE IN ONE SENTENCE WHAT THE RELEASE WAS ABOUT -->

<!-- DESCRIBE MAIN FEATURES IN BULLET FORM -->

<!-- EXAMPLE -->
<!-- - **Podman 4.5.1**: Podman 4.5.1 now included in Windows and Mac installers. -->

Podman Desktop X.X is now available. [Click here to download it](/downloads)!

<!-- IDEALLY, ADD CARTOON SELKIE FOR RELEASE -->

<!-- EXAMPLE -->
<!-- Release images are available: https://github.com/containers/podman-desktop-internal/tree/main/release-images -->
<!-- ![Podman-desktop-1-1-hero](img/podman-desktop-release-1.1/podman-desktop-release-1.1.png) -->

---

## Release details

<!-- DESCRIBE MAJOR CHANGES, INCLUDE IMAGES / VIDEO IF APPLICABLE -->

<!-- EXAMPLE -->
<!-- ### Podman v4.5.1 -->
<!-- Podman Desktop 1.1 moves up to [Podman 4.5.1](https://github.com/podman-container-tools/podman/releases/tag/v4.5.1). -->

<!-- WHEN DESCRIBING NAVBAR SECTIONS, INCLUDE ICON -->
<!-- EXAMPLE -->
<!-- We've also added options in **<icon icon="fa-solid fa-cog" size="lg" />Settings > Preferences** to automatically check for and install extension updates. -->

---

## Other notable enhancements

<!-- CATCHALL SECTION FOR MINOR ENHANCEMENTS -- >
<!-- USE BULLET POINTS -->
<!-- EXAMPLE -->
<!-- - Show warning when creating a pod with two containers that use the same port [#2671](https://github.com/containers/podman-desktop/pull/2671). -->

---

## Notable bug fixes

<!-- CATCHALL SECTION FOR BUG FIXES -- >
<!-- USE BULLET POINTS -->
<!-- EXAMPLE -->
<!-- - Could not install extensions on Windows 10 [#2762](https://github.com/containers/podman-desktop/pull/2762). -->

---

## Community thank you

🎉 We’d like to say a big thank you to everyone who helped to make Podman Desktop even better. In this
release we received pull requests from the following people:

<!-- INCLUDE SHOUTOUTS TO OUTSIDE CONTRIBUTORS -->
<!-- EXAMPLE -->
<!-- - [AsciiWolf](https://github.com/AsciiWolf) in [#2607 - fix typing error in Flathub name](https://github.com/containers/podman-desktop/pull/2607) and [#2609 - fix Flatpak install instructions](https://github.com/containers/podman-desktop/pull/2609) -->

---

## Final notes

<!-- EDIT BELOW VERSION NUMBERS! -->
The complete list of issues fixed in this release is available [here](https://github.com/containers/podman-desktop/issues?q=is%3Aclosed+milestone%3AX.X.0) and [here](https://github.com/containers/podman-desktop/issues?q=is%3Aclosed+milestone%3AX.X.0).

Get the latest release from the [Downloads](/downloads) section of the website and boost your development journey with Podman Desktop. Additionally, visit the [GitHub repository](https://github.com/containers/podman-desktop) and see how you can help us make Podman Desktop better.
```
