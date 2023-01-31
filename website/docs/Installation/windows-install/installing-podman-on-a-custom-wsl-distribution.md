---
sidebar_position: 12
title: Installing Podman on a custom WSL distribution
description: You can install Podman on Windows on a custom WSL distribution.
tags: [podman-desktop, podman, installing, windows, wsl]
keywords: [podman desktop, containers, podman, installing, installation, windows]
---

# Installing Podman on Windows on a custom Windows Subsystem for Linux (WSL) distribution

On Windows, running the Podman container engine requires running a Linux distribution on a virtual machine.

Consider installing a custom WSL distribution rather than [installing Podman with Podman Desktop](installing-podman-with-podman-desktop) when:

* You prefer building your distribution of Linux.

#### Prerequisites

* 6 GB RAM
* No VPN
* [WSL prerequisites](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting#error-0x80370102-the-virtual-machine-could-not-be-started-because-a-required-feature-is-not-installed)
  * User with administrator privileges
  * Windows 64bit
  * Windows 10 Build 18362 or greater, or Windows 11
  * On Windows Enterprise, Pro, or Education:  [Hyper-V enabled](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v)
  * On a virtual machine: [Nested Virtualization enabled](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/user-guide/nested-virtualization#configure-nested-virtualization)
  * *Virtual Machine Platform* optional feature enabled
* `MYCONTAINER`: A container image for your Linux distribution with [Podman](https://podman.io/getting-started/installation#installing-on-linux), such as https://quay.io/repository/podman/stable

#### Procedure

1. Enable the features necessary to run WSL and install the Ubuntu distribution of Linux. See [Installing Linux on Windows with WSL](https://learn.microsoft.com/en-us/windows/wsl/install):

    ```powershell
    > wsl --install
    ```
2. Set the default version to WSL 2 to install a Linux distribution:

    ```powershell
    > wsl --set-default-version 2
    ```

3. Start a session in the default WSL distribution:

    ```powershell
    > wsl
    ```

4. Run the commands from the default WSL distribution to export a tar file containing your Linux distribution from a container. Set the `<MYCONTAINER>` value for your container:

     ```shell-session
     $ sudo -i
     # apt-get install -y buildah
   
     ## Instantiate the Image
     # CONTNR=$(buildah from <MYCONTAINER>)
   
     ## Mount the image
     # MNTPNT=$(buildah mount $CONTNR)
   
     ## Enter the mount point
     # cd $MNTPNT

     ## Create a tar file of the container filesystem, outside of the mounted filesystem
     # tar cvf /opt/my-linux.tar .
     ```

5. Copy the `my-linux.tar` file to the `C:\WSLDistributions\` directory.

6. Import your Linux distribution into WSL:

    ```powershell
    > wsl --import MyLinux C:\WSLDistributions\MyLinux C:\WSLDistributions\my-linux.tar
    ```

7. Run your WSL distribution:

    ```powershell
    > wsl -d MyLinux
    ```

#### Verification steps

1. Start Podman Desktop. It detects Podman in your WSL distribution.

2. Verify `ImagePath` is pointing to your Linux distribution in the  `C:\Users\YOUR_USER_NAME\.config\containers\podman\machine\wsl\my-machine.json` file.

#### Additional resources

* [Using custom WSL Linux distribution](https://learn.microsoft.com/en-us/windows/wsl/use-custom-distro)
* [Red Hat Universal Base Image (UBI) on Windows Subsystem for Linux 2 with Rootless Podman](https://kenmoini.com/post/2022/04/rhel-ubi-on-wsl2-with-rootless-podman/)

#### Next steps

* [Getting Started with Podman Desktop](/docs/getting-started/getting-started)
