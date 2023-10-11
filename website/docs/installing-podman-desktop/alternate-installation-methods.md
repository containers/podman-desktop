---
sidebar_position: 2
title: Alternate installation methods.
description: Consider installing Podman Desktop using one of the alternate installation method when you cannot use the default installation method.
keywords: [podman desktop, containers, podman, installing, installation]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installing Podman Desktop with alternate installation methods

Consider using one of these alternate installation method when you cannot use the [default installation method](/docs/installing-podman-desktop).

<Tabs groupId="operating-systems">
<TabItem value="win" label="Windows silent">

#### Prerequisites

- Windows 10 or 11.

#### Procedure

1. [Download the Windows installer](/downloads/windows).
1. Run the PowerShell command:

   ```shell-session
   > Start-Process -ArgumentList "\S" -Wait -FilePath '.\podman-desktop-<version>-setup.exe'
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

<TabItem value="mac" label="Homebrew">

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

<TabItem value="mac-intel" label="macOS Intel">

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

<TabItem value="mac-arm" label="macOS Arm">

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

<TabItem value="linux" label="Flatpak bundle">

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

<TabItem value="linux-archive" label="Linux archive">

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

#### Next steps

Podman Desktop does not automatically set up resources that you might not need.

Set up the resources that your container and Kubernetes workloads require:

- [Onboarding for container workloads](/docs/onboarding/containers).
- [Onboarding for Kubernetes workloads](/docs/onboarding/kubernetes).
