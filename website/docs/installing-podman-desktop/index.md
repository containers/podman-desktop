---
sidebar_position: 2
title: Installing
description: You can install Podman Desktop on Windows, macOS, and Linux.
pagination_prev: null
pagination_next: onboarding-for-containers/index
tags: [podman-desktop, installing]
keywords: [podman desktop, containers, podman, installing, installation]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installing Podman Desktop

<Tabs groupId="operating-systems">

<TabItem value="win" label="Windows">

<Tabs groupId="alternatives">

<TabItem value="installer" label="Windows installer">

#### Prerequisites

- Windows 10 or 11.

#### Procedure

1. [Download the Windows installer](/downloads/windows).
1. Open the downloaded file to start the Podman Desktop installer, and follow the instructions.

#### Verification

- Open Podman Desktop from the desktop icon.
- Open Podman Desktop from the **Windows** menu.

</TabItem>

<TabItem value="silent" label="Silent Windows installer">

#### Prerequisites

- Windows 10 or 11.

#### Procedure

1. [Download the Windows installer](/downloads/windows).
1. Run from the command line:

   ```shell-session
   $ podman-desktop-<version>-setup.exe /S
   ```

#### Verification

- Open Podman Desktop from the desktop icon.
- Open Podman Desktop from the **Windows** menu.

</TabItem>
<TabItem value="chocolatey" label="Chocolatey">

#### Prerequisites

- Windows 10 or 11.
- [Chocolatey package manager](https://chocolatey.org/install).

#### Procedure

- Run the command from the command line to install [Podman Desktop Chocolatey package](https://community.chocolatey.org/packages/podman-desktop):

  ```shell-session
  $ choco install podman-desktop
  ```

#### Verification

- Open Podman Desktop from the desktop icon.
- Open Podman Desktop from the **Windows** menu.

</TabItem>

<TabItem value="winget" label="Winget">

#### Prerequisites

- Windows 10 or 11.
- [Winget Package manager for Windows](https://aka.ms/getwinget).

#### Procedure

- Run the command from the command line to install [Podman Desktop Winget package](https://winget.run/pkg/RedHat/Podman-Desktop):

  ```shell-session
  $ winget install -e --id RedHat.Podman-Desktop
  ```

#### Verification

- Open Podman Desktop from the desktop icon.
- Open Podman Desktop from the **Windows** menu.

</TabItem>

<TabItem value="windows-scoop" label="Scoop">

#### Prerequisites

- Windows 10 or 11.
- [Scoop package manager](https://github.com/ScoopInstaller/Install#readme).

#### Procedure

- Run the commands from the command line to install [Podman Desktop Scoop package](https://scoop.sh/#/apps?q=podman-desktop&s=0&d=1&o=true)
  :

  ```shell-session
  $ scoop bucket add extras
  $ scoop install podman-desktop
  ```

#### Verification

- Open Podman Desktop from the desktop icon.
- Open Podman Desktop from the **Windows** menu.

</TabItem>

</Tabs>

</TabItem>

<TabItem value="mac" label="macOS">

<Tabs groupId="alternatives">

<TabItem value="universal-dmg" label="Universal Disk Image">

#### Prerequisites

- macOS.

#### Procedure

1. [Download the Universal `.dmg` file](/downloads/macos).
1. Open the downloaded file to open the disk image.
1. Drag the Podman Desktop icon to the Applications folder.

#### Verification

- Open Podman Desktop from **Launchpad**.
- Open Podman Desktop from the **Applications** directory.

</TabItem>

<TabItem value="intel-dmg" label="Intel Disk Image">

#### Prerequisites

- macOS.
- Intel hardware.

#### Procedure

1. [Download the Intel `.dmg` file](/downloads/macos).
1. Open the downloaded file to open the disk image.
1. Drag the Podman Desktop icon to the Applications folder.

#### Verification

- Open Podman Desktop from **Launchpad**.
- Open Podman Desktop from the **Applications** directory.

</TabItem>

<TabItem value="arm-dmg" label="Arm Disk Image">

#### Prerequisites

- macOS.
- Apple M1 hardware.

#### Procedure

1. [Download the Arm `.dmg` file](/downloads/macos).
1. Open the downloaded file to open the disk image.
1. Drag the Podman Desktop icon to the Applications folder.

#### Verification

- Open Podman Desktop from **Launchpad**.
- Open Podman Desktop from the **Applications** directory.

</TabItem>

<TabItem value="brew" label="Homebrew">

#### Prerequisites

- macOS.
- [Homebrew](https://brew.sh/).

### Installation steps

- Run the commands from the command line to install Podman Desktop Homebrew package:

  ```shell-session
  $ brew install podman-desktop
  ```

#### Verification

- Open Podman Desktop from **Launchpad**.
- Open Podman Desktop from the **Applications** directory.

</TabItem>

</Tabs>

</TabItem>

<TabItem value="linux" label="Linux">

<Tabs groupId="alternatives">

<TabItem value="flathub" label="Flathub">

#### Prerequisites

- Linux.
- [Flatpak](https://flatpak.org/setup/)

#### Procedure

1. Enable the Flathub repository:

   ```shell-session
   $ flatpak remote-add --if-not-exists --user flathub https://flathub.org/repo/flathub.flatpakrepo
   ```

2. Install Podman Desktop from Flathub:

   ```shell-session
   $ flatpak install --user flathub io.podman_desktop.PodmanDesktop
   ```

#### Verification

- Open Podman Desktop from the **Development** menu.
- Open Podman Desktop from a terminal:

  ```shell-session
  $ flatpak run io.podman_desktop.PodmanDesktop
  ```

</TabItem>

<TabItem value="flatpak-bundle" label="Flatpak bundle">

#### Prerequisites

- Linux.
- [Flatpak](https://flatpak.org/setup/).

#### Procedure

1. [Download the Flatpak bundle to a `podman-desktop-<version>.flatpak` file](/downloads/linux).
1. Install Podman Desktop from the downloaded Flatpak bundle:

   ```shell-session
   $ flatpak install --user podman-desktop-<version>.flatpak
   ```

#### Verification

- Open Podman Desktop from the **Development** menu.
- Open Podman Desktop from a terminal:

  ```shell-session
  $ flatpak run io.podman_desktop.PodmanDesktop
  ```

</TabItem>

<TabItem value="linux-archive" label="AMD64 binary archive">

#### Prerequisites

- Linux.
- `tar`.

#### Procedure

1. [Download the AMD64 binary (tar.gz) to a `podman-desktop-<version>.tar.gz` file](/downloads/linux).
2. Extract the content.

   ```shell-session
   $ tar xvzf podman-desktop-<version>.tar.gz
   ```

3. Go to the extracted directory.

   ```shell-session
   $ cd podman-desktop-<version>
   ```

#### Verification

- Open Podman Desktop from the `podman-desktop` executable file.

  ```shell-session
  $ ./podman-desktop
  ```

</TabItem>

</Tabs>

</TabItem>

</Tabs>
