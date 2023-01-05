---
sidebar_position: 5
title: Linux
description: You can install Podman Desktop on Linux from Flathub, a Flatpak bundle, or a ZIP archive.
tags: [podman-desktop, installing, linux, flathub, flatpak]
keywords: [podman desktop, podman, containers, installing, installation, linux, flathub, flatpak]
---

# Installing Podman Desktop on Linux

You can install Podman Desktop from:

* [Flathub](#flathub)
* [A Flatpak bundle](#flatpak-bundle)
* [An archive](#archive)

## Installing Podman Desktop from Flathub {#flathub}

Consider installing the Podman Desktop from Flathub to have:

* One command installation
* Package updates

#### Prerequisites

* [Flatpak](https://flatpak.org/setup/)
* [Podman](https://podman.io/whatis.html) stable version

#### Procedure

1. Add the Flathub repository:

    ```shell
    $ flatpak remote-add --if-not-exists --user flathub https://flathub.org/repo/flathub.flatpakrepo
    ```

2. Install Podman Desktop from Flathub:

    ```shell
    $ flatpak install --user flathub io.podman_desktop.PodmanDesktop
    ```

#### Verification

* Open Podman Desktop from a terminal:

  ```shell
  $ flatpak run io.podman_desktop.PodmanDesktop
  ```

#### Update

* Update Podman Desktop from Flathub:

  ```shell
  $ flatpak update --user io.podman_desktop.PodmanDesktop
  ```

#### Additional resources

* [Podman Desktop Flathub package](https://flathub.org/apps/details/io.podman_desktop.PodmanDesktop)
* [Using Flatpak](https://docs.flatpak.org/en/latest/using-flatpak.html)

#### Next steps

* [Getting started](../getting-started/getting-started)

## Installing Podman Desktop from a Flatpak bundle {#flatpak-bundle}

Consider installing a Flatpak bundle rather than Flathub when:

* You cannot use Flathub.
* You want to install an unreleased version.

#### Prerequisites

* [Flatpak](https://flatpak.org/setup/)
* [Podman](https://podman.io/whatis.html) stable version

#### Procedure

1. Download the Flatpak bundle to a `$HOME/Downloads/podman-desktop-<version>.flatpak`file from:

    * [Downloads page](../../../downloads/linux)

    * [Git repository release assets](https://github.com/containers/podman-desktop/releases)

2. Install the Flatpak bundle:

    ```shell
    $ flatpak install --user $HOME/Downloads/podman-desktop-<version>.flatpak 
    ```

#### Verification

* Open Podman Desktop from a terminal:

    ```shell
    $ flatpak run io.podman_desktop.PodmanDesktop
    ```

#### Additional resources

* [Using Flatpak](https://docs.flatpak.org/en/latest/using-flatpak.html)

#### Next steps

* [Getting started](../getting-started/getting-started).

## Installing Podman Desktop from an archive {#archive}

Consider installing from an archive rather than from Flathub, or a Flatpak bundle when:

* You cannot use Flatpak.
* You install in a restricted environment.

#### Prerequisites

* [Podman](https://podman.io/whatis.html) stable version

#### Procedure

1. Download the
   `podman-desktop-<version>.tar.gz` archive from the [Git repository release assets](https://github.com/containers/podman-desktop/releases).
2. Extract the content.
3. Go to the extracted directory.
4. Double-click on the `podman-desktop` executable file.

#### Next steps

* [Getting started](../getting-started/getting-started)
