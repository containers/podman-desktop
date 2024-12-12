---
sidebar_position: 2
title: Installing from a Flatpak bundle
description: You can install Podman Desktop on Linux from a Flatpak bundle.
tags: [podman-desktop, installing, linux, flathub, flatpak]
keywords: [podman desktop, podman, containers, installing, installation, linux, flathub, flatpak]
---

# Installing Podman Desktop from a Flatpak bundle {#flatpak-bundle}

Consider installing a Flatpak bundle rather than [from Flathub](/docs/installation/linux-install) when:

- You cannot use Flathub.
- You want to install an unreleased version.

#### Prerequisites

- [Flatpak](https://flatpak.org/setup/)
- [Podman](https://podman.io/) stable version

#### Procedure

1. Download the Flatpak bundle to a `$HOME/Downloads/podman-desktop-<version>.flatpak` file from:

   - [Downloads page](/downloads/linux)

   - [Git repository release assets](https://github.com/podman-desktop/podman-desktop/releases)

2. Install Podman Desktop from the downloaded Flatpak bundle:

   ```shell-session
   $ flatpak install --user $HOME/Downloads/podman-desktop-<version>.flatpak
   ```

#### Verification

- Open Podman Desktop from a terminal:

  ```shell-session
  $ flatpak run io.podman_desktop.PodmanDesktop
  ```

#### Additional resources

- [Using Flatpak](https://docs.flatpak.org/en/latest/using-flatpak.html)

#### Next steps

- [Getting started](/docs/containers).
