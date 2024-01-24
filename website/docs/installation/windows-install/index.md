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

1. Open the downloaded file to start the Podman Desktop installer.

<details>
<summary>
Alternatively, when your environment requires another installation method, consider installing with:
- Silent Windows installer
- Chocolatey
- Scoop
- Winget
</summary>

#### Silent Windows installer

To install the Podman Desktop Windows installer without user interaction:

1. [Download the Windows installer](/downloads/windows).

1. Run the Windows installer with the silent flag `/S` from the Command Prompt:

   ```shell-session
   > podman-desktop-1.6.4-setup-x64.exe /S
   ```

#### Chocolatey

To install the [Podman Desktop Chocolatey package](https://community.chocolatey.org/packages/podman-desktop):

1. Install the [Chocolatey package manager](https://chocolatey.org/install).

1. Run the command from the Command Prompt:

   ```shell-session
   > choco install podman-desktop
   ```

#### Scoop package manager for Windows

To install the [Podman Desktop Scoop package](https://scoop.sh/#/apps?q=podman-desktop&s=0&d=1&o=true):

1. [Install the Scoop package manager](https://github.com/ScoopInstaller/Install#readme).

1. Run the commands from the Command Prompt:

   ```shell-session
   > scoop bucket add extras
   > scoop install podman-desktop
   ```

#### Winget

To install the [Podman Desktop Winget package](https://winget.run/pkg/RedHat/Podman-Desktop):

1. [Install the Winget Package manager for Windows](https://aka.ms/getwinget).

1. Run the command from the Command Prompt:

   ```shell-session
   > winget install -e --id RedHat.Podman-Desktop
   ```

</details>

## Installing Podman

On Windows, running the Podman container engine requires running a Linux distribution on a virtual machine.

Podman Desktop can assist you to install the Podman container engine in a Fedora distribution of Linux, on a virtual machine: the Podman Machine.

Main benefits are:

- Ease of use.
- [Windows Subsystem for Linux version 2 (WSL 2)](https://learn.microsoft.com/en-us/windows/wsl/about#what-is-wsl-2) native virtualization performance.

Check that your environment has:

- 6 GB RAM for the Podman Machine.
- [WSL prerequisites](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting#error-0x80370102-the-virtual-machine-could-not-be-started-because-a-required-feature-is-not-installed):
  - The Windows user has administrator privileges.
  - Windows 64bit.
  - Windows 10 Build 19043 or greater, or Windows 11.
  - On a virtual machine: [Nested Virtualization enabled](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/user-guide/nested-virtualization#configure-nested-virtualization).

<details>
<summary>
Alternatively, consider installing the Podman Preset in OpenShift Local when you require one of following:

- Full control on the virtual machine.
- HyperV virtual machine, rather than WSL 2.
- The Windows user is a member of the _Hyper-V Administrators_ group, rather than having administrator privileges.
  The user can add a virtual machine, start or stop this virtual machine, and access the resources related to this virtual machine.
- Windows 10 version 1709 or later, Enterprise or Professional edition, or Windows 11, Enterprise or Professional edition.

</summary>

1. Install the OpenShift Local extension.

2. Install OpenShift Local.

3. To run the next commands, open the Command Prompt.

4. Select the [Podman container runtime preset](https://access.redhat.com/documentation/en-us/red_hat_openshift_local/2.12/html/getting_started_guide/using_gsg#about-presets_gsg):

   ```shell-session
   > crc config set preset podman
   ```

5. Set up your host machine for Red Hat OpenShift Local:

   ```shell-session
   > crc setup
   ```

6. Start the Red Hat OpenShift instance:

   ```shell-session
   > crc start
   ```

</details>

To install the Podman Machine:

1. To enable the WSL feature without installing the default Ubuntu distribution of Linux, run the command from the Command Prompt.
   See [Enabling WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install) and [WSL basic commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands):

   ```shell-session
   > wsl --install --no-distribution
   ```

1. Open Podman Desktop.

1. At first run, you see the **Get started with Podman Desktop** screen.

   Click on the **Go to Podman Desktop** button.

1. The **Dashboard** screen displays: _<Icon icon="fa-solid fa-info" size="lg" /> Podman needs to be set up_.

   Click the **Set up** button.

1. The **Podman Setup** screen displays: _We could not find Podman. Let's install it!_

   Click the **Next** button.

1. Podman Desktop checks the prerequisites to install Podman.
   When necessary, follow the instructions to install prerequisites.

1. The **Podman** dialog displays: _Podman is not installed on this system, would you like to install Podman?_

   Click the **Yes** button.

1. The **Podman Setup** window asks for confirmation.

   Click the **Install** button.

1. The **User Account Control** window asks for confirmation.

   Click the **Yes** button.

1. The **Podman Setup** window asks for confirmation.

   Click the **Close** button.

1. Get back to the **Podman Desktop** window.

   The **Podman Setup** screen displays _Podman successfully installed_.

   Review the options, and click the **Next** button.

1. The **Podman Setup** screen displays: _We could not find any Podman machine. Let's create one!_

   Click the **Next** button.

1. The **Podman Setup** screen displays: _Create a Podman machine_.

   Review the options, browse to the bottom of the page, and click the **Create** button.

1. The Podman Desktop window displays the **Dashboard** screen again.

   The **Podman** tile displays _Podman is running_.

#### Next steps

- [Work with containers](/docs/containers).
- [Work with Kubernetes](/docs/kubernetes).
