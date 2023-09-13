---
sidebar_position: 5
title: Installing in a restricted environment
description: Installing Podman Desktop on Windows in a restricted environment
tags: [podman-desktop, installing, windows, restricted-environment]
keywords: [podman desktop, containers, podman, installing, installation, windows, restricted-environment]
---

# Installing Podman Desktop and Podman in a restricted environment

Consider using the Windows installer for restricted environments to install the Podman Desktop and Podman in a restricted environment.

The Windows installer for restricted environments:

- Has all artifacts required to install Podman Desktop and Podman.
- Does not require Internet access to download resources during installation.
- Does not contain additional utilities such as Compose or Kind.

#### Prerequisites

- [Windows Subsystem for Linux (WSL) prerequisites](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting#error-0x80370102-the-virtual-machine-could-not-be-started-because-a-required-feature-is-not-installed)

  - User with administrator privileges
  - Windows 64bit
  - Windows 10 Build 18362 or greater, or Windows 11
  - On a virtual machine: [Nested Virtualization enabled](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/user-guide/nested-virtualization#configure-nested-virtualization)

- [You installed WSL](https://docs.microsoft.com/en-us/windows/wsl/install):

  ```powershell
  > wsl --install --no-distribution
  ```

#### Procedure

1. [Download the Windows installer for restricted environments](/downloads), and copy the downloaded file to the Windows host in a restricted environment.
1. Run the Windows installer for restricted environments to install Podman Desktop.
1. Open Podman Desktop and click the **Install** button to install Podman.
1. (Optionally) [Configure Podman Desktop to run behind your proxy](/docs/proxy/using-a-proxy).
1. (Optionally) [Configure Podman to run behind your VPN](/docs/proxy/using-a-vpn-on-windows).
1. [Create and start a Podman machine](/docs/Installation/creating-a-podman-machine-with-podman-desktop)

#### Next steps

- [Getting Started with Podman Desktop](/docs/getting-started).
