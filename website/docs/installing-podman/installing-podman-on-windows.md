---
sidebar_position: 1
title: Installing Podman on Windows
description: Podman Desktop can assist you to install Podman on Windows.
tags: [podman-desktop, installing, windows]
keywords: [podman desktop, containers, podman, installing, installation, windows]
---

# Installing Podman on Windows

On Windows, running the Podman container engine requires running a Linux distribution on a virtual machine.

To install Podman you can:

* [Install Podman in Podman Desktop](#installing-podman-in-podman-desktop)
* [Install the Podman Preset in OpenShift Local](#installing-the-podman-preset-in-openshift-local)


## Installing Podman in Podman Desktop

Podman Desktop can assist you to install the Podman container engine on the Windows Subsystem for Linux, version 2 (WSL 2).

WSL 2 uses Windows native virtualization: it runs as a HyperV virtual machine. 


#### Prerequisites

* User with administrator privileges
* No VPN
* Windows 11

#### Procedure

* Use Podman Desktop default Podman installer.

#### Additional resources

* [What is WSL 2](https://learn.microsoft.com/en-us/windows/wsl/about#what-is-wsl-2).

## Installing the Podman Preset in OpenShift Local

Consider installing the Podman Preset in OpenShift Local when you require one of following:

* No WSL 2
* Full control on the HyperV virtual machine
* User without administrator privileges
* VPN
* Windows 10

#### Prerequisites

* The user is a member of the *Hyper-V Administrators* group. The user can add a virtual machine, start or stop this virtual machine, and access the resources related to this virtual machine.

#### Procedure

1. [Install OpenShift Local](https://console.redhat.com/openshift/create/local)

2. Select the Podman container runtime preset:

    ```
    $ crc config set preset podman
    ```

3. Set up your host machine for Red Hat OpenShift Local:

    ```
    $ crc setup
    ```

4. Start the Red Hat OpenShift instance:
    ```
    $ crc start
    ```

#### Additional resources

* [Red Hat OpenShift Local presets](https://access.redhat.com/documentation/en-us/red_hat_openshift_local/2.12/html/getting_started_guide/using_gsg#about-presets_gsg)
