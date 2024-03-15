---
sidebar_position: 5
title: Linux
description: You can install Podman Desktop on Linux from Flathub, a Flatpak bundle, or a ZIP archive.
tags: [podman-desktop, installing, linux, flathub, flatpak]
keywords: [podman desktop, podman, containers, installing, installation, linux, flathub, flatpak]
---

# Installing Podman Desktop on Linux

Consider installing the Podman Desktop from Flathub to have:

- One command installation
- Package updates

Alternatively, you can install Podman Desktop from:

- [A Flatpak bundle](/docs/installation/linux-install/installing-podman-desktop-from-a-flatpak-bundle)
- [A compressed tar file](/docs/proxy

#### Prerequisites

- [Flatpak](https://flatpak.org/setup/)
- [Podman](https://podman.io/) stable version

#### Procedure

1. Verify the Flathub repository is enabled, and add it if required:

   ```shell-session
   $ flatpak remote-add --if-not-exists --user flathub https://flathub.org/repo/flathub.flatpakrepo
   ```

2. Install Podman Desktop from Flathub:

   ```shell-session
   $ flatpak install --user flathub io.podman_desktop.PodmanDesktop
   ```

#### Verification

- Open Podman Desktop from a terminal:

  ```shell-session
  $ flatpak run io.podman_desktop.PodmanDesktop
  ```

#### Update

- Update Podman Desktop from Flathub:

  ```shell-session
  $ flatpak update --user io.podman_desktop.PodmanDesktop
  ```

#### Additional resources

- [Podman Desktop Flathub package](https://flathub.org/apps/details/io.podman_desktop.PodmanDesktop)
- [Using Flatpak](https://docs.flatpak.org/en/latest/using-flatpak.html)

#### Next steps

- [Working with containers](/docs/containers)
