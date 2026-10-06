# Release Process for Podman Desktop

This is the authoritative release process. Steps marked **REQUIRED** should be completed
for every release. Steps marked **IF NEEDED** apply only in specific situations (noted
inline). The release is not complete until the Announce phase is done.

The release owner rotates. If you have not done a release recently, follow this document
start to finish. If anything is unclear, ask in the team channel on Slack or Discord
before proceeding.

## Release record (fill in per release)

The release tracking issue template (`.github/ISSUE_TEMPLATE/release.yml`) asks for these
fields. This table is the reference for what each field means.

| Field                     | Required? | Value                                      |
| ------------------------- | --------- | ------------------------------------------ |
| **Version**               | Yes       | X.Y.Z                                      |
| **Milestone**             | Yes       | [link]                                     |
| **Release owner**         | Yes       | @username                                  |
| **QE contact**            | Optional  | @username                                  |
| **Blog author**           | Optional  | @username (often the release owner)        |
| **48h notification date** | Yes       | YYYY-MM-DD                                 |
| **Target trigger date**   | Yes       | YYYY-MM-DD                                 |
| **Dependencies / holds**  | Optional  | e.g., "holding for Podman X.Y.Z" or "none" |
| **Notes / deviations**    | Optional  |                                            |

> 💡 **Proposed (optional):** The team may also find these fields useful:
>
> - **Release owner backup** -- @username (cover for PTO/holidays)
> - **QE backup** -- @username (cover for PTO/holidays)
> - **QE testing issue** -- link (referenced in [Testing sign-off](#testing-sign-off))
> - **Target promote-to-latest date** -- YYYY-MM-DD
> - **Target announce-complete date** -- YYYY-MM-DD

## Typical release week

Adjust based on QE availability and dependencies; some tasks may require extra days.

- **Monday (Notify):** Post 48-hour notification. Communicate to maintainers and
  public channels that a release will be cut on Wednesday and to merge any pending PRs.
  Inform QE team. Start work on the blog post, as it is usually the longest part of the
  release process.
- **Tuesday (Staging, Testing & Blog):** Stage the release (see instructions below) to
  create a new cut of the release to test. Test the pre-release build briefly. Get
  feedback from committers (if applicable). Push the blog post for review (as it usually
  takes a few back-and-forth reviews on documentation).
- **Wednesday (Release):** Cut the new release using the release process below. The
  release will take 24 hours to hit all release channels (Flatpak, Brew, Chocolatey,
  etc.). We aim to have a release out _by Thursday_ so we do not have any surprises
  leading into the weekend.
- **Thursday (Post-release Testing & Blog):** Test the post-release build briefly for
  any critical bugs. Confirm that new release has been pushed to all release channels.
  Push the blog post live. Get a known issues list together from QE and publish to the
  Podman Desktop Discussions, link to this from the release notes.
- **Friday (Communicate):** Friday is statistically the best day for new announcements.
  Post on internal channels. Post on Reddit, Hacker News, social media, etc.

---

## Phase 1: Prepare

### 1.1 Create the release tracking issue and confirm scope -- REQUIRED

1. Create a GitHub issue using the **Release vX.Y.Z** template (see
   `.github/ISSUE_TEMPLATE/`). Fill in the release record. This issue is your checklist
   for the entire release.
2. Open the [milestone](https://github.com/podman-desktop/podman-desktop/milestones) for
   this release. Confirm with maintainers that all must-merge PRs are merged or explicitly
   deferred.
3. Any PR still open against the milestone is a potential release blocker. Resolve or
   remove it before proceeding.
4. Coordinate with the person writing the blog / release notes. If you are assigned, see
   the [Documentation](#documentation) section.

### 1.2 Post 48-hour notification -- REQUIRED

Post the following to the team Slack channel AND Discord **at least 48 hours** before you
plan to trigger the release workflow:

> **Release notification: Podman Desktop vX.Y.Z**
>
> I plan to trigger the vX.Y.Z release on **[DAY, DATE]**.
>
> Milestone: [link]
> Tracking issue: [link]
>
> If you have PRs that must land in this release, please merge them before [DATE - 1 day].
> After that, remaining PRs will be deferred or cherry-picked post-release.
>
> Release owner: [name]

---

### 🛑 STOP GATE A: Do not trigger the release workflow until:

1. ✅ 48-hour notification posted
2. ✅ All blocking PRs confirmed merged (milestone clean)
3. ✅ Release tracking issue created with release record filled in

---

## Phase 2: Release

### 2.1 Releasing on GitHub -- REQUIRED

1. Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/release.yaml
2. Click on the top right drop-down menu `Run workflow`.
3. Enter the name of the release (e.g., `1.30.0`). **DO NOT** use the `v` prefix.
4. Specify the branch: `main` for all major releases. For a bugfix release, select the
   `X.Y.x` branch.
5. Click on `Run workflow`.
6. Note: takes approximately 30-50 minutes. Work on the blog post and complete the next
   steps while you wait.
7. Close the milestone for the respective release, make sure that all tasks within the
   milestone are completed / updated before closing.
   https://github.com/podman-desktop/podman-desktop/milestones
8. If not already created, click on `New Milestone` and create a new milestone for the
   NEXT release.
9. Check that the workflow has completed. Sometimes it will flake, so you may need to
   re-run it.
10. There should be an automated PR titled `chore: 📢 Bump version to X.Y+1.0`. Approve
    this and set to auto-merge. This will be automatically merged after all tests pass
    (takes 10-30 minutes). Rerun workflow manually if some e2e tests are failing.
    **Above PR MUST be merged before continuing with the steps.**
11. Edit the new release at
    `https://github.com/podman-desktop/podman-desktop/releases/edit/vX.Y.Z`.
    Select previous tag and click on `Generate release notes`, then click `Update release`.
12. 🚨 Create the Flathub PR once the release is available. **Hold the merge until QE
    approves.**
    - Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/publish-flathub.yaml
    - Click `Run workflow`, enter the release version (no `v`), click `Run workflow`.
    - View PR at: https://github.com/flathub/io.podman_desktop.PodmanDesktop/pulls/podman-desktop-bot
13. Approve `npmjs-publish.yaml` workflow.
    **IMPORTANT NOTE:** We should wait for the release notes (blog PR) to be merged before
    approving, because Podman Desktop displays release notes in the UI on update.
    - Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/npmjs-publish.yaml?query=is%3Awaiting
    - Click `View details`, then `Review Deployment`.
    - Check `npmjs-publish.yaml`, then `Approve and Deploy`.
    - Cancel any other pending runs from prior respins.
14. Approve `schemastore-sync-extension-schema.yaml` workflow.
    - Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/schemastore-sync-extension-schema.yaml?query=is%3Awaiting
    - Click `View details`, then `Review Deployment`.
    - Check `schemastore-sync-extension-schema.yaml`, then `Approve and Deploy`.
    - Cancel any other pending runs.

### 2.2 Test pre-release -- REQUIRED

The release is a **pre-release**, it means it is not yet the latest version, so no clients
will automatically update to this version.

Inform QE the **pre-release** is out! It allows QE (and everyone else) to download and
test these binaries before they go live or are in the package managers.

The release may be tested using the assets generated within the pre-release.

> 💡 **Proposed (optional):** Post a structured message in the team channel:
>
> > **Pre-release vX.Y.Z is out.** QE and everyone else can download and test from the
> > [release assets](https://github.com/podman-desktop/podman-desktop/releases/tag/vX.Y.Z).
> > Tracking issue: [link]

### 2.3 QE and cherry picking -- IF NEEDED

❌ All critical bugs and regressions reported by QE are investigated and reviewed. If we
determine that any of these issues warrant blocking the release, the necessary fixes will
be implemented, and a new release candidate will be created -- incrementing the patch
version (e.g., X.Y.1 instead of X.Y.0).

**Cherry picking:**

If there are fixes that need to be made to the release as brought up by QE the following
steps need to be completed:

1. Create the cherry-fix branch `X.Y.x` from tag `vX.Y.Z`:

```sh
git fetch --tags
git checkout -b X.Y.x vX.Y.Z
git push origin X.Y.x
```

2. Create PRs with fixes that merge into `main` and use Mergify to backport:
   `@Mergifyio backport X.Y.x`
3. Make sure all PRs are merged before re-spinning.

**Re-spin a release:**

1. Go to `Run workflow` in [Releasing on GitHub](#21-releasing-on-github----required) again.
2. **MAKE SURE** you specify that you want to use the `X.Y.x` branch, NOT `main` under
   `Branch to use for the release`.
3. Version to release should be `X.Y.Z+1` (e.g., `1.30.1`).
   **IMPORTANT NOTE:** Literally `X.Y.Z+1`, NOT the branch name `X.Y.x`.

### Testing sign-off

Before promoting a pre-release to latest, wait for official sign-off.

**Notification:** After testing is done, designated release owner will be tagged on Slack in a message that includes one of two explicit status lines:

- `QE is approving the release of <version>` - **GO:** Proceed with the remaining release steps.
- `QE is not approving the release of <version>` - **NO-GO:** Hold the release until blockers are resolved.

**Bug details:** The message includes a direct link to the GitHub testing issue. Review the comment on that issue for the full list of discovered bugs, test results, and details.

Do not proceed with promotion until an approval message is posted.

---

### 🛑 STOP GATE B: Do not promote to latest until:

1. ✅ QE approval message posted ("QE is approving the release of X.Y.Z") per [Testing sign-off](#testing-sign-off)
2. ✅ Double check with the Project Manager / Technical lead that the release notes are ready
3. ✅ Blog post / release notes PR merged (Podman Desktop displays release notes in the UI on update; the data must be live first)

---

### 2.4 Promote to latest -- REQUIRED

✅ After [Testing sign-off](#testing-sign-off), we have a green light!

**Do not forget to change the release from 'pre-release' to 'latest release' before
proceeding.**

1. Go to your release: `https://github.com/podman-desktop/podman-desktop/releases/tag/vX.Y.Z`
2. Press the edit button.
3. Uncheck `Set as a pre-release`.

**IMPORTANT NOTE:** Only the .z version that was approved by QE should be changed from
pre-release to release. Any previous blocked versions need to stay as pre-release.

---

## Phase 3: Announce

**The release is not complete until all REQUIRED steps below are done.**

### 3.1 Update package managers -- REQUIRED

Pre-requisite: Ensure the release is OK (green workflow, artifacts are there at
https://github.com/podman-desktop/podman-desktop/releases).

**Flathub:** Merge the PR created in step 2.1.12 (held until QE approved and promoted).
https://github.com/flathub/io.podman_desktop.PodmanDesktop/pulls/podman-desktop-bot

**Brew:** ⏭️ Brew bot automation handles the update. No manual action necessary.

**Winget:**

1. Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/publish-to-winget.yaml
2. Select the release tag (e.g., `v1.30.0`) and enter the version (no `v`).
3. Run workflow.
4. View PR at: https://github.com/microsoft/winget-pkgs/pulls?q=is%3Apr+podman-desktop

**Chocolatey:**

1. Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/publish-to-chocolatey.yaml
2. Run from `main`. Enter the version (no `v`).
3. Approve the resulting PR: `chore: Update Chocolatey package to X.Y.Z`
4. View progress at: https://community.chocolatey.org/packages/podman-desktop/X.Y.Z

### 3.2 Update podman.io -- REQUIRED

1. Go to https://github.com/podman-desktop/podman-desktop/actions/workflows/publish-to-podman_io.yaml
2. Select the release tag and enter the version (no `v`).
3. Run workflow.
4. Check PR at: https://github.com/containers/podman.io/pull/

### 3.3 Confirm blog post is live -- REQUIRED

Verify the blog post is published at `https://podman-desktop.io/blog/podman-desktop-release-X.Y`.
(The blog PR should have been merged before Gate B. This step is a confirmation.)

### 3.4 Announcements -- REQUIRED

**GitHub Discussions:**

Create an announcement at https://github.com/podman-desktop/podman-desktop/discussions

> Hello,
>
> A new release of Podman Desktop is out: [vX.Y.Z](https://github.com/podman-desktop/podman-desktop/milestone/XX?closed=1)
>
> Download it from the [download section](https://podman-desktop.io/downloads) of the [Podman Desktop website](https://podman-desktop.io/)
>
> Release Notes are available at https://podman-desktop.io/blog/podman-desktop-release-X.Y
>
> Full Changelog is available at https://github.com/podman-desktop/podman-desktop/releases/tag/vX.Y.Z

**If you get a permissions error** on the Announcements category, ask a repo admin to
either post it or grant you access. This is a known issue for rotation members who have
not posted before.

**Reddit:**

An example of a previous post: https://www.reddit.com/r/podman/comments/10moat6/a_new_version_of_podman_desktop_is_out_v0110/

1. Click create post on the [Podman Desktop subreddit](https://www.reddit.com/r/podmandesktop/).
2. Title it: `A new version of Podman Desktop is out: vX.Y.Z`
3. Link to the blog post rather than pasting full release notes (easier to read on mobile).

**Email:**

1. Send to `devtools-team@redhat.com`, `Podman-Desktop@redhat.com`.
2. Check with the PM about the `product-announce` announcement (high level).
3. Send to `podman-desktop@lists.podman.io` (no links to Red Hat internal Slack, etc.).

---

### Release complete

When all Announce steps are done, close the tracking issue. The closed issue is the signal
that the release is complete.

> 💡 **Proposed (optional):** Post a "Release vX.Y.Z is complete" message in the team
> channel as a visible signal alongside the issue close.

---

## Documentation

### Release notes

You can generate release notes by using the [release notes tool](https://github.com/podman-desktop/tool-release-notes). This will go through each PR that is linked with the given milestone and automatically generate release notes.

> **NOTE:** If the issue is not in the given milestone it will not be in release notes. The release notes are generated locally on your machine; you just need to add the images with editing the highlighted PRs (since those can be generated by AI model). And copy the release notes to the right folder in the podman-desktop repository.

OR manually:

1. Use the [release notes template](#release-notes-template) below.
2. Create a PR to the blog folder of the website using the file format:
   `website/blog/YYYY-MM-DD-release-X.Y.md`
3. Example of request when using `gh` CLI tool for the X.Y.0 milestone:
   `gh pr list --limit 300 --repo "podman-desktop/podman-desktop" --search "state:closed milestone:X.Y.0" --json title,number,url --template '{{range .}}- {{.title}} [#{{.number}}]({{.url}}){{"\n"}}{{end}}'`
4. Add any images to the `website/img/podman-desktop-release-X.Y` folder.
5. Ping the respective docs maintainers for a review before merging.

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

<!-- CATCHALL SECTION FOR MINOR ENHANCEMENTS -->
<!-- USE BULLET POINTS -->
<!-- EXAMPLE -->
<!-- - Show warning when creating a pod with two containers that use the same port [#2671](https://github.com/podman-desktop/podman-desktop/pull/2671). -->

---

## Notable bug fixes

<!-- CATCHALL SECTION FOR BUG FIXES -->
<!-- USE BULLET POINTS -->
<!-- EXAMPLE -->
<!-- - Could not install extensions on Windows 10 [#2762](https://github.com/podman-desktop/podman-desktop/pull/2762). -->

---

## Community thank you

🎉 We'd like to say a big thank you to everyone who helped to make Podman Desktop even better. In this
release we received pull requests from the following people:

<!-- INCLUDE SHOUTOUTS TO OUTSIDE CONTRIBUTORS -->
<!-- EXAMPLE -->
<!-- - [AsciiWolf](https://github.com/AsciiWolf) in [#2607 - fix typing error in Flathub name](https://github.com/podman-desktop/podman-desktop/pull/2607) and [#2609 - fix Flatpak install instructions](https://github.com/podman-desktop/podman-desktop/pull/2609) -->

---

## Final notes

<!-- EDIT BELOW VERSION NUMBERS! -->
The complete list of issues fixed in this release is available [here](https://github.com/podman-desktop/podman-desktop/issues?q=is%3Aclosed+milestone%3AX.X.0).

Get the latest release from the [Downloads](/downloads) section of the website and boost your development journey with Podman Desktop. Additionally, visit the [GitHub repository](https://github.com/podman-desktop/podman-desktop) and see how you can help us make Podman Desktop better.
```
