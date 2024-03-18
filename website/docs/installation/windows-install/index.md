---
sidebar_position: 1
title: Windows
description: How to install Podman Desktop and Podman on Windows.
tags: [podman-desktop, installing, windows]
keywords: [podman desktop, containers, podman, installing, installation, windows]
---

# Installing Podman Desktop and Podman on Windows

## Installing Podman Desktop

To install Podman Desktop:

1. [Download the Windows installer](/downloads/windows).

1. To start the Podman Desktop installer, open the downloaded file.

   ![Podman Desktop Setup installing](img/podman-desktop-setup-installing.png)

<details>
<summary>
Alternate installation methods:
- Silent Windows installer
- Chocolatey
- Scoop
- Winget
</summary>

#### Silent Windows installer

1. [Download the Windows installer](/downloads/windows).

1. To install without user interaction, run the Windows installer with the silent flag `/S` from the Command Prompt:

   ```shell-session
   > podman-desktop-1.6.4-setup-x64.exe /S
   ```

#### Chocolatey

1. Install the [Chocolatey package manager](https://chocolatey.org/install).

1. Install from the terminal:

   ```shell-session
   > choco install podman-desktop
   ```

#### Scoop package manager for Windows

1. [Install the Scoop package manager](https://github.com/ScoopInstaller/Install#readme).

1. Install from the terminal:

   ```shell-session
   > scoop bucket add extras
   > scoop install podman-desktop
   ```

#### Winget

1. [Install the Winget Package manager for Windows](https://aka.ms/getwinget).

1. Install from the terminal:

   ```shell-session
   > winget install -e --id RedHat.Podman-Desktop
   ```

</details>

## Installing Podman

On Windows, running the Podman container engine requires running a Linux distribution on a virtual machine.

Podman Desktop creates a [Windows Subsystem for Linux version 2 (WSL 2)](https://learn.microsoft.com/en-us/windows/wsl/about#what-is-wsl-2) virtual machine: the Podman Machine.

Main benefits are:

- Ease of use.
- WSL 2 native virtualization performance.

Check that your environment has:

- 6 GB RAM for the Podman Machine.
- Windows Subsystem for Linux version 2 (WSL 2) prerequisites. See [Enabling WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install), [WSL basic commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands), and [Troubleshooting WSL 2](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting#error-0x80370102-the-virtual-machine-could-not-be-started-because-a-required-feature-is-not-installed):
  - The Windows user has administrator privileges.
  - Windows 64bit.
  - Windows 10 Build 19043 or greater, or Windows 11.
  - On a virtual machine: [Nested Virtualization enabled](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/user-guide/nested-virtualization#configure-nested-virtualization).

To install the Podman Machine:

1. To prepare your system, enable the WSL feature, without installing the default Ubuntu distribution of Linux.

   Open the Command Prompt, and run:.

   ```shell-session
   > wsl --install --no-distribution
   ```

1. Restart your computer.

1. The **Dashboard** screen displays: _<Icon icon="fa-solid fa-info" size="lg" /> Podman needs to be set up_.

   ![Podman needs set up screen](img/dashboard-podman-needs-set-up.png)

   Click the **Set up** button.

   Review and validate all confirmation screens to set up the Podman Machine.

   When necessary, follow the instructions to install system prerequisites.

To verify that Podman is set up:

- In the **Dashboard**, the **Podman** tile displays _Podman is running_.

  ![Podman is running screen](img/dashboard-podman-is-running.png)

#### Next steps

- [Work with containers](/docs/containers).
- [Work with Kubernetes](/docs/kubernetes).
