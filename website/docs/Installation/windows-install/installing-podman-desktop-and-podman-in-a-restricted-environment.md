---
sidebar_position: 5
title: Installing Podman Desktop in a restricted environment
description: Installing Podman Desktop on Windows in a restricted environment
tags: [podman-desktop, installing, windows, restricted-environment]
keywords: [podman desktop, containers, podman, installing, installation, windows, restricted-environment]
---

# Installing Podman Desktop and Podman in a restricted environment

Consider using the Windows installer for restricted environments to install the Podman Desktop and Podman in a restricted environment.

The Windows installer for restricted environments:
* Has all artifacts required for installation
* Does not require Internet access to download resources during installation

#### Prerequisites

* [Windows Subsystem for Linux (WSL) prerequisites](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting#error-0x80370102-the-virtual-machine-could-not-be-started-because-a-required-feature-is-not-installed)
  * User with administrator privileges
  * Windows 64bit
  * Windows 10 Build 18362 or greater, or Windows 11
  * On a virtual machine: [Nested Virtualization enabled](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/user-guide/nested-virtualization#configure-nested-virtualization)

* [You installed WSL](https://docs.microsoft.com/en-us/windows/wsl/install):

  ```powershell
  > wsl --install --no-distribution
  ```

#### Procedure

1. [Download the Windows installer for restricted environments](/downloads), and copy the downloaded file to the Windows host in a restricted environment.
2. Run the Windows installer for restricted environments to install Podman Desktop.
3. Open Podman Desktop and click on the **Install** button to install Podman.
4. Click on **Initialize Podman**.

#### Next steps

* [Getting Started with Podman Desktop](/docs/getting-started/getting-started)
