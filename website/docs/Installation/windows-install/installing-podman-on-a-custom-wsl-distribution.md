---
sidebar_position: 12
title: Installing Podman on a custom WSL distribution
description: Podman Desktop can assist you to install Podman on Windows.
tags: [podman-desktop, podman, installing, windows, wsl]
keywords: [podman desktop, containers, podman, installing, installation, windows]
---

# Installing Podman on Windows on a custom WSL distribution

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
  * *Virtual Machine Platform* optional component enabled
* Podman is not installed
* No WSL 2 Linux virtual machine is running

#### Procedure

1. Enable the WSL feature without installing the default Ubuntu distribution of Linux. See [Enabling WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install) and [WSL basic commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands):

    ```powershell
    wsl --install --no-distribution
    wsl --set-default-version 2
    ```

2. Export a tar file containing your Linux distribution from a container. Set the `MYCONTAINER` value for your container, and run the commands on a Linux system:

     ```
     # Set the value for your container
     MYCONTAINER=https://quay.io/repository/podman/stable 
     
     ## Fedora/RHEL Install buildah
     sudo dnf install -y buildah
     
     ## Debian/Ubuntu Install buildah
     sudo apt-get install -y buildah

     ## Switch to the root user
     sudo -i

     ## Instantiate the Image
     CONTNR=$(buildah from $MYCONTAINER)

     ## Mount the image
     MNTPNT=$(buildah mount $CONTNR)

     ## Enter the mount point
     cd $MNTPNT

     ## Create a tar file of the container filesystem, outside of the mounted filesystem
     tar cvf /opt/my-linux.tar .
     ```

3. Copy the `my-linux.tar` file to the `C:\WSLDistros\` directory.

4. Import your Linux distribution into WSL:

    ```
    wsl --import MyLinux C:\WSLDistros\MyLinux C:\WSLDistros\my-linux.tar
    ```

5. (Optionally) Set your WSL distribution as default:

    ```
    wsl --set-default MyLinux
    ```

6. Run your WSL distribution:

    ```
    wsl -d MyLinux
    ```

7. (Optionally) From your WSL distribution, [install Podman](https://podman.io/getting-started/installation#installing-on-linux) if required.

8. From your WSL distribution, verify Podman is running:
9. Configure Podman Desktop to use your WSL distribution. Edit the  `C:\Users\YOUR_USER_NAME\.config\containers\podman\machine\wsl\my-machine.json` file and set `ImagePath`.

    ```
    TODO
    ```

#### Additional resources

* [Understanding WSL 2](https://learn.microsoft.com/en-us/windows/wsl/about#what-is-wsl-2).
* [Using custom WSL Linux distribution](https://learn.microsoft.com/en-us/windows/wsl/use-custom-distro)
* [Red Hat UBI on Windows Subsystem for Linux 2 with Rootless Podman](https://kenmoini.com/post/2022/04/rhel-ubi-on-wsl2-with-rootless-podman/)

#### Next steps

* [Getting Started with Podman Desktop](/docs/getting-started/getting-started)
