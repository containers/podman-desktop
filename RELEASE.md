# Release process for Podman Desktop

## Release notes

Start the release notes before the pre-release workflow.

You can generate release notes by using the [release notes tool](https://github.com/podman-desktop/tool-release-notes), which goes through each PR and creates it accordingly.

Alternatively, you can manually create it:

1. Use an [example template](#release-notes-template) for the release notes.
1. Create a PR to the blog folder of the website using the file format: `website/blog/2023-07-12-release-0.13.md`
1. Example of request when using `gh` cli tool for 1.9.0 milestone: `gh pr list --limit 300 --repo "podman-desktop/podman-desktop" --search "state:closed milestone:1.9.0" --json title,number,url --template '{{range .}}- {{.title}} [#{{.number}}]({{.url}}){{"\n"}}{{end}}'`
1. Add any images to the `website/img/podman-desktop-release-0.13` folder.

Before the merge:

1. Request a review from the docs maintainers.
1. Get approval from domain reviewers (PM, engineering, docs)
1. Preview the highlighted features on the PD dashboard (max of 3 bullet points). Shorten lines that wrap.

## Pre-requisites

- Create Task issue `Release vX.X.X` for the current sprint (if such an issue does not already exist), then update the type to Release and assign it to yourself.
- Confirm with Podman Desktop maintainers that pending / need-to-go-in PR's have been merged.
- Release notes for the blog: Communicate with the person who has been tasked with creating the documentation. If you are assigned, see [Release notes](#release-notes).

In the below example, we will pretend that we're upgrading from `0.11.0` to `0.12.0`. Please use the CORRECT release numbers as these are just example numbers.

## Release timeline

Below is what a typical release week may look like (This is just an example of timeline, some tasks may require extra days to complete):

- **Monday (Notify):** 48-hour notification. Communicate to maintainers and public channels a release will be cut on Wednesday and to merge any pending PRs. Inform QE team. Start work on blog post as it is usually the longest part of the release process.
- **Tuesday (Staging, Testing & Blog):** Stage the release (see instructions below) to create a new cut of the release to test. Test the pre-release (master branch) build briefly. Get feedback from committers (if applicable). Push the blog post for review (as it usually takes a few back-and-forth reviews on documentation).
- **Wednesday (Release):** Cut the new release using the below release process. The release will take 24 hours for release to hit all release channels (Flatpak, Brew, Chocolatey, etc.). We aim to have a release out _by Thursday_ so we do not have any surprises leading into the weekend.
- **Thursday (Post-release Testing & Blog):** Test the post-release build briefly for any critical bugs. Confirm that new release has been pushed to all release channels. Push the blog post live. Get a known issues list together from QE and publish to the Podman Desktop Discussions, link to this from the release notes.
- **Friday (Communicate):** Friday is statistically the best day for new announcements. Post on internal channels. Post on reddit, hackernews, twitter, etc.

## Releasing on GitHub

### Main release

For patch updates and QE re-spins, use [Patch releases](#patch-releases).

1. Notify the main contributors on Discord / Slack before the pre-release. Include the completed milestone link and ask about blockers:

   > A pre-release will be triggered for 0.12.0. Here is the completed milestone: `<milestone link>`. Do you have any blockers?

1. Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/release.yaml
1. Click on the top right drop-down menu `Run workflow`
1. Enter the name of the release. Example: `0.12.0` (DO NOT use the v prefix like v0.12.0)
1. Set `Branch to use for the release` to `main`.
1. Click on the `Run workflow` button.
1. Note: `Run workflow` takes approximately 30-50 minutes. Brew a coffee, work on the release notes, and/or complete the next two steps while you wait.
1. Close the milestone for the respective release, make sure that all tasks within the milestone are completed / updated before closing. https://github.com/podman-desktop/podman-desktop/milestones
1. If not already created, click on `New Milestone` and create a new milestone for the NEXT release.
1. Check that https://github.com/podman-desktop/podman-desktop/actions/workflows/release.yaml has been completed. Sometimes it will flake, so you may need to re-run it.
1. There should be an automated PR that has been created. Approve this and set to auto-merge. This will be automatically merged in after all tests have been ran (takes 10-30 minutes). The title looks like `chore: 📢 Bump version to 0.13.0`. Rerun workflow manually if some of e2e tests are failing.
1. Above PR MUST be merged before continuing with the steps.
1. Edit the new release https://github.com/podman-desktop/podman-desktop/releases/edit/v0.12.0
1. Select previous tag (v0.11.0) and click on `Generate release notes` and then click on `Update release`

Continue with [Prepare for QE](#prepare-for-qe).

### Patch releases

Use this checklist for QE re-spins and fixes after a release.

**Cherry picking:**

1. If `0.12.x` does not exist, create it from the original release tag, `v0.12.0`:

   ```sh
   $ git fetch origin --tags
   $ git checkout -b 0.12.x v0.12.0
   $ git push --set-upstream origin 0.12.x
   ```

   If the branch exists, reuse it for subsequent patches. Do not create it from `main`.

1. Create PRs with the fixes that merge into `main`.
1. Use Mergify to open backport PRs with this comment on each main PR: `@Mergifyio backport 0.12.x`.
1. Wait for all fix PRs and backport PRs to merge before a re-spin.

**Re-spin a release:**

1. Update the existing blog release notes with this patch version and its fixes, including each re-spin.
1. Notify the main contributors on Discord / Slack about the patch pre-release and ask about blockers.
1. Open the [release workflow](https://github.com/podman-desktop/podman-desktop/actions/workflows/release.yaml).
1. Set `Branch to use for the release` to `0.12.x`.

   **Important:** Do not select `main` for a re-spin.

1. Set `Version to release` to `0.12.1`, or the next unused patch version. Do not enter `v0.12.1` or `0.12.x`.
1. Click `Run workflow`.
1. Wait for the workflow to complete.
1. Edit the new release at https://github.com/podman-desktop/podman-desktop/releases/edit/v0.12.1.
1. Select the previous tag and click `Generate release notes`.
1. Click `Update release`.

Continue with [Prepare for QE](#prepare-for-qe) for each patch, including each re-spin.

### Prepare for QE

1. 🚨 Create the Flathub PR once the release is available. This allows users / QE to test the new version. **Do not merge it before QE approval.**

   This PR can be created by doing the following:
   - Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/publish-flathub.yaml
   - Click on the top right drop-down `Run workflow`
   - Enter the release version, for example `0.12.0` or `0.12.1`. Do not add the `v`.
   - Click `Run workflow`
   - You can view the PR at: https://github.com/flathub/io.podman_desktop.PodmanDesktop/pulls/podman-desktop-bot

## Test release before it is rolling out.

The release is a **pre-release**, it means it is not yet the latest version, so no clients will automatically update to this version.

Inform QE the **pre-release** is out! It allows QE (and everyone else) to download and test these binaries before they go live or are in the package managers.

The release may be tested using the assets generated within the pre-release.

## QE and cherry picking fixes

- ❌ All critical bugs and regressions reported by QE are investigated and reviewed. If an issue blocks the release, the team implements the fixes and creates a new release candidate. The patch version increases, for example, from `0.12.0` to `0.12.1`.

Follow [Patch releases](#patch-releases) for the branch, backport, and re-spin steps.

## Testing sign-off

Before promoting a pre-release to latest, wait for official sign-off.

**Notification:** After testing is done, designated release owner will be tagged on Slack in a message that includes one of two explicit status lines:

- `QE is approving the release of <version>` - **GO:** Proceed with the remaining release steps.
- `QE is not approving the release of <version>` - **NO-GO:** Hold the release. Follow [Patch releases](#patch-releases) for fixes, then repeat QE tests and wait for sign-off.

**Bug details:** The message includes a direct link to the GitHub testing issue. Review the comment on that issue for the full list of discovered bugs, test results, and details.

Do not proceed with promotion until an approval message is posted.

## Change from pre-release to release

✅ After [Testing sign-off](#testing-sign-off), we have a green light!

1. Make sure that the release notes PR includes the final patch version and approval from both @Firewall and @slemeur.
1. Merge the release notes before flagging the release as the 'latest': It is because Podman Desktop is displaying in the UI the release notes of the new release, so as soon as there is an update, the data needs to be there.

**DO NOT FORGET to change from pre-release to release!**

This is done on your release URL

**Do not forget to change the release from 'pre-release' to 'latest release' before proceeding**.

1.  Go to your release: https://github.com/podman-desktop/podman-desktop/releases/tag/vX.X.X
2.  Press the edit button.
3.  Uncheck `Set as a pre-release`
4.  Click `Update release`.

**This change triggers update notifications for all Podman Desktop users.**

**IMPORTANT NOTE:** Only the .z version that was approved by QE should be changed from pre-release to release. Any previous blocked versions need to stay as pre-release. For example, if the respin version `0.12.1` was approved by QE after finding bugs in `0.12.0`, only `0.12.1` should be moved from pre-release to release.

## Updating the podman.io website

**Update podman.io immediately after promotion.** Old download links cause users to install an outdated version and receive an update notification.

The below workflow will create a PR for the Podman [website](https://podman.io) by updating the version number.

1. Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/publish-to-podman_io.yaml
1. Click on the top right drop-down `Run workflow`
1. Select the release (under tags), which would be `v0.12.0`
1. Enter the release version `0.12.0`. DO NOT add the `v`
1. Click `Run workflow`
1. Make sure that the PR exists at https://github.com/podman-container-tools/podman.io/pulls.
1. Ask someone with merge rights to merge the PR promptly.

## Publishing packages and the extension schema

**Note:** After a re-spin, runs for previous release tags also wait for approval.

1. Approve `npmjs-publish.yaml` workflow after the release notes merge.

   The workflow waits for manual approval.
   - Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/npmjs-publish.yaml?query=is%3Awaiting
   - Click on `View details` of the run corresponding to the release you wish to publish
   - Click on `Review Deployment`
   - Check `npmjs-publish.yaml` then click on `Approve and Deploy`
   - Cancel all other pending runs.

1. Approve `schemastore-sync-extension-schema.yaml` workflow

   The workflow waits for manual approval.
   - Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/schemastore-sync-extension-schema.yaml?query=is%3Awaiting
   - Click on `View details` of the run corresponding to the release you wish to sync
   - Click on `Review Deployment`
   - Check `schemastore-sync-extension-schema.yaml` then click on `Approve and Deploy`
   - Cancel all other pending runs.

## Updating package managers (Brew, Winget, Chocolatey, Flathub)

Pre-requisites:

- Ensure the release is OK (green workflow, artifacts are there https://github.com/podman-desktop/podman-desktop/releases).

### Flathub

PR was created during the release, but it was not yet merged.
The link to the PR is at https://github.com/flathub/io.podman_desktop.PodmanDesktop/pulls/podman-desktop-bot

1. Make sure that the PR passes all tests and that QE approves the Flathub PR.
1. Ask someone with merge rights to merge the PR.

#### Brew

⏭️ Brew bot automation handles the update on the Brew side. No manual action is necessary.

#### Winget

Publish to winget. The workflow will create an automated PR to the Winget pkgs repository https://github.com/microsoft/winget-pkgs/

1. Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/publish-to-winget.yaml
1. Click on the top right drop-down `Run workflow`
1. Select the release (under tags), which would be `v0.12.0`
1. Enter the release version `0.12.0`. DO NOT add the `v`
1. Click `Run workflow`

You can view the PR at: https://github.com/microsoft/winget-pkgs/pulls?q=is%3Apr+podman-desktop

#### Chocolatey

Publish to chocolatey. The workflow will create an automatic submission to the chocolatey site at https://community.chocolatey.org/packages/podman-desktop/#versionhistory

1. Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/publish-to-chocolatey.yaml
1. Click on the top right drop-down `Run workflow`
1. Run the workflow from the main branch.
1. Enter the release version `0.12.0`. DO NOT add the `v`
1. Click `Run workflow`

Afterwards, you'll have to:

- Approve the PR with title `chore: Update Chocolatey package to 0.12.0` at https://github.com/podman-desktop/podman-desktop/pulls?q=is%3Apr+Update+Chocolatey

You can view the progress at: https://community.chocolatey.org/packages/podman-desktop/0.12.0

## Announcements

#### Release notes

1. Make sure that the Project Manager / Technical lead agrees that the release notes are ready.
1. Make sure that the release notes are live on the blog before announcements.

#### Github discussions

1. Create a new announcement at https://github.com/podman-desktop/podman-desktop/discussions
1. Example template:

```
Hello,

A new release of Podman Desktop is out: [v0.12.0](https://github.com/podman-desktop/podman-desktop/milestone/12?closed=1)

Download it from the [download section](https://podman-desktop.io/downloads) of the [Podman Desktop website](https://podman-desktop.io/)

Release Notes are available at https://podman-desktop.io/blog/podman-desktop-release-0.12

Full Changelog is available at https://github.com/podman-desktop/podman-desktop/releases/tag/v0.12.0
```

#### Create a post on Reddit

See [previous release posts in the Podman Desktop subreddit](https://www.reddit.com/r/podmandesktop/search/?q=release&restrict_sr=on).

1. Click create post on the [Podman Desktop subreddit](https://www.reddit.com/r/podmandesktop/).
2. Title it: `A new version of Podman Desktop is out: v0.12.0`
3. Copy over release notes (markdown works on Reddit)
4. Replace `<ThemedImage>` components with Markdown links to the images, such as `[Screenshot](https://podman-desktop.io/img/...)`.

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
<!-- This image link is used for social media previews / thumbnails. Release images are available: https://github.com/redhat-developer/podman-desktop-internal/tree/main/release-images -->
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
<!-- Release images are available: https://github.com/redhat-developer/podman-desktop-internal/tree/main/release-images -->
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
<!-- - Show warning when creating a pod with two containers that use the same port [#2671](https://github.com/podman-desktop/podman-desktop/pull/2671). -->

---

## Notable bug fixes

<!-- CATCHALL SECTION FOR BUG FIXES -- >
<!-- USE BULLET POINTS -->
<!-- EXAMPLE -->
<!-- - Could not install extensions on Windows 10 [#2762](https://github.com/podman-desktop/podman-desktop/pull/2762). -->

---

## Community thank you

🎉 We’d like to say a big thank you to everyone who helped to make Podman Desktop even better. In this
release we received pull requests from the following people:

<!-- INCLUDE SHOUTOUTS TO OUTSIDE CONTRIBUTORS -->
<!-- EXAMPLE -->
<!-- - [AsciiWolf](https://github.com/AsciiWolf) in [#2607 - fix typing error in Flathub name](https://github.com/podman-desktop/podman-desktop/pull/2607) and [#2609 - fix Flatpak install instructions](https://github.com/podman-desktop/podman-desktop/pull/2609) -->

---

## Final notes

<!-- EDIT BELOW VERSION NUMBERS! -->
The complete list of issues fixed in this release is available [here](https://github.com/podman-desktop/podman-desktop/issues?q=is%3Aclosed+milestone%3AX.X.0) and [here](https://github.com/podman-desktop/podman-desktop/issues?q=is%3Aclosed+milestone%3AX.X.0).

Get the latest release from the [Downloads](/downloads) section of the website and boost your development journey with Podman Desktop. Additionally, visit the [GitHub repository](https://github.com/podman-desktop/podman-desktop) and see how you can help us make Podman Desktop better.
```
