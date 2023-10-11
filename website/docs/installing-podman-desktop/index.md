---
sidebar_position: 2
title: Installing Podman Desktop
description: You can install Podman Desktop on Windows, macOS, and Linux.
tags: [podman-desktop, installing]
keywords: [podman desktop, containers, podman, installing, installation]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installing Podman Desktop

Consider installing Podman Desktop with this default intallation method unless you require:

- [Installing Podman Desktop with alternate installation methods](/docs/installing-podman-desktop/alternate-installation-methods).
- [Installing Podman Desktop in a restricted environment](/docs/restricted-environment).

<Tabs groupId="operating-systems">
<TabItem value="win" label="Windows">

#### Prerequisites

- Windows 10 or 11.

#### Procedure

1. [Download the Windows installer](/downloads/windows).
1. Open the downloaded file to start the Podman Desktop installer, and follow the instructions.

#### Verification

- Open Podman Desktop from the desktop icon.
- Open Podman Desktop from the **Windows** menu.

</TabItem>
<TabItem value="mac" label="macOS">

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
<TabItem value="linux" label="Linux">

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
</Tabs>

#### Next steps

Podman Desktop does not automatically set up resources that you might not need.

- [Set up resources for container workloads](/docs/onboarding/containers).
- [Set up resources for Kubernetes workloads](/docs/onboarding/kubernetes).
