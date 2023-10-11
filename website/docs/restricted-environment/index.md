---
sidebar_position: 2
title: Restricted environment
description: You can install Podman Desktop on Windows, macOS, and Linux.
tags: [podman-desktop, installing]
keywords: [podman desktop, containers, podman, installing, installation]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installing Podman Desktop and Podman in a restricted environment

Consider using specific bundles to install the Podman Desktop and Podman in a restricted environment.

The bundles for restricted environments:

- Have all artifacts required to install Podman Desktop and Podman.
- Do not require Internet access to download resources during installation.
- Do not contain additional utilities such as Compose or Kind.

<Tabs groupId="operating-systems">
<TabItem value="win" label="Windows">

#### Prerequisites

- [Windows Subsystem for Linux (WSL) prerequisites](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting#error-0x80370102-the-virtual-machine-could-not-be-started-because-a-required-feature-is-not-installed)

  - User with administrator privileges
  - Windows 64bit
  - Windows 10 Build 19043 or greater, or Windows 11
  - On a virtual machine: [Nested Virtualization enabled](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/user-guide/nested-virtualization#configure-nested-virtualization)

- [You installed WSL](https://docs.microsoft.com/en-us/windows/wsl/install):

  ```powershell
  > wsl --install --no-distribution
  ```

#### Procedure

1. [Download the Windows installer for restricted environments for your platform](/downloads/windows).
2. Copy the downloaded file to the Windows host in a restricted environment.
3. Run the downloaded file to install Podman Desktop.
4. Open Podman Desktop from the desktop icon or the **Windows** menu.
5. Click the **Install** button to install Podman.

#### Verification

- Open Podman Desktop from the desktop icon.
- Open Podman Desktop from the **Windows** menu.

</TabItem>
<TabItem value="mac" label="macOS">

#### Prerequisites

- macOS.

#### Procedure

1. [Download the Disk Image for restricted environments](/downloads/macos).
1. Open the downloaded file to open the disk image.
1. Drag the Podman Desktop icon to the Applications folder.
1. Open Podman Desktop and click the **Install** button to install Podman.

#### Verification

- Open Podman Desktop from **Launchpad**.
- Open Podman Desktop from the **Applications** directory.

</TabItem>
<TabItem value="linux" label="Linux">

#### Prerequisites

- [Flatpak](https://flatpak.org/setup/)

#### Procedure

#### Verification

- Open Podman Desktop from the **Development** menu.
- Open Podman Desktop from a terminal:

  ```shell-session
  $ flatpak run io.podman_desktop.PodmanDesktop
  ```

</TabItem>
</Tabs>

#### Next steps

- [Configure Podman Desktop to run behind your proxy](/docs/proxy/using-a-proxy).
- [Configure Podman to run behind your VPN](/docs/proxy/using-a-vpn-on-windows).

Podman Desktop does not automatically set up resources that you might not need. Set up the resources that your container and Kubernetes workloads require:

- [Create and start a Podman machine](/docs/onboarding/containers/creating-a-podman-machine-with-podman-desktop).
- [Set up resources for Kubernetes workloads](/docs/onboarding/kubernetes).
