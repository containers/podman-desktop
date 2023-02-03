---
sidebar_position: 12
title: Installing Podman on a custom WSL distribution
description: You can install Podman on Windows on a custom WSL distribution.
tags: [podman-desktop, podman, installing, windows, wsl]
keywords: [podman desktop, containers, podman, installing, installation, windows]
---

# Installing Podman on Windows on a custom Windows Subsystem for Linux (WSL) distribution

On Windows, running the Podman container engine requires running a Linux distribution on a virtual machine.

Consider installing a custom WSL distribution to, replace the default created when [installing Podman with Podman Desktop](installing-podman-with-podman-desktop) when:

* You prefer building your distribution of Linux.

#### Prerequisites

* 6 GB RAM
* No VPN
* [WSL prerequisites](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting#error-0x80370102-the-virtual-machine-could-not-be-started-because-a-required-feature-is-not-installed)
  * User with administrator privileges
  * Windows 64bit
  * Windows 10 Build 18362 or greater, or Windows 11
  * On a virtual machine: [Nested Virtualization enabled](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/user-guide/nested-virtualization#configure-nested-virtualization)
* `MYCONTAINER`: A container image for your Linux distribution with [Podman](https://podman.io/getting-started/installation#installing-on-linux), such as `quay.io/podman/stable`
* [Podman is installed and initialized](installing-podman-with-podman-desktop.md) to use the

#### Procedure

1. Start a session in superuser mode in the podman-machine-default WSL distribution:

    ```powershell
    > wsl --distribution podman-machine-default --user root
    ```

2. Run the commands from the Ubuntu WSL distribution to export a tar file containing your Linux distribution from your `<MYCONTAINER>` container:

     ```shell-session
     # podman run -ti --name my-linux <MYCONTAINER> true
     # cd $(podman mount my-linux)
     # tar cvf /opt/my-linux.tar .
     # exit
     ```

3. Import your Linux distribution into WSL. It creates an `ext4.vdhx` file in the `MyLinux` directory.

    ```powershell
    > wsl --import MyLinux MyLinux \\wsl$\podman-machine-default\opt\my-linux.tar
    ```

4. Set your WSL distribution as default:

    ```powershell
    > wsl --set-default MyLinux
    ```

5. Run your WSL distribution:

    ```powershell
    > wsl --distribution MyLinux
    ```

6. Register your WSL distribution as a Podman machine.

// TODO

#### Verification steps

1. Start Podman Desktop. It detects Podman in your WSL distribution.

2. Verify `ImagePath` is pointing to your Linux distribution in the  `C:\Users\YOUR_USER_NAME\.config\containers\podman\machine\wsl\my-machine.json` file.

#### Additional resources

* [Using custom WSL Linux distribution](https://learn.microsoft.com/en-us/windows/wsl/use-custom-distro)
* [Red Hat Universal Base Image (UBI) on Windows Subsystem for Linux 2 with Rootless Podman](https://kenmoini.com/post/2022/04/rhel-ubi-on-wsl2-with-rootless-podman/)

#### Next steps

* [Getting Started with Podman Desktop](/docs/getting-started/getting-started)
