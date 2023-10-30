---
sidebar_position: 10
title: Installing Podman
description: Podman Desktop can assist you to install Podman on Windows and macOS.
tags: [podman-desktop, podman, installing, windows]
keywords: [podman desktop, containers, podman, installing, installation, windows, macos]
---

# Installing Podman with Podman Desktop

On Windows and macOS, running the Podman container engine requires running a Linux distribution on a virtual machine.
Podman Desktop can assist you to install the Podman container engine in a Fedora distribution of Linux, on a virtual machine.

Main benefits are:

- Ease of use.
- On Windows: Windows Subsystem for Linux version 2 (WSL 2) native virtualization performance.

Consider rather [installing Podman with OpenShift Local](/docs/podman/installing-podman-with-openshift-local-on-windows) if your environment doesn't allow you to meet the prerequisites.

#### Prerequisites

- Podman is not installed.
- 6 GB RAM.
- The host runs Windows or macOS.
- Windows prerequisites:
  - [WSL prerequisites](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting#error-0x80370102-the-virtual-machine-could-not-be-started-because-a-required-feature-is-not-installed):
    - User with administrator privileges.
    - Windows 64bit.
    - Windows 10 Build 19043 or greater, or Windows 11.
    - On a virtual machine: [Nested Virtualization enabled](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/user-guide/nested-virtualization#configure-nested-virtualization).
  - No WSL 2 Linux virtual machine is running.

#### Procedure

1. (On Windows) Enable the WSL feature without installing the default Ubuntu distribution of Linux.
   See [Enabling WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install) and [WSL basic commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands):

   ```powershell
   wsl --install --no-distribution
   ```

2. The **Home** screen displays _Podman Desktop was not able to find an installation of Podman_.
   Click **Install**.

3. Podman Desktop checks the prerequisites to install Podman.
   When necessary, follow the instructions to install prerequisites.

4. Podman displays the dialog: _Podman is not installed on this system, would you like to install Podman?_.
   Click `Yes` to install Podman, and follow the installation program instructions.

5. Click **Initialize Podman**.

#### Additional resources

- [Understanding WSL 2](https://learn.microsoft.com/en-us/windows/wsl/about#what-is-wsl-2).

#### Next steps

- [Getting Started with Podman Desktop](/docs/containers)
