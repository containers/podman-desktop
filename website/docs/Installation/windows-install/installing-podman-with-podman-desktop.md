---
sidebar_position: 11
title: Installing Podman on Windows
description: Podman Desktop can assist you to install Podman on Windows.
tags: [podman-desktop, podman, installing, windows]
keywords: [podman desktop, containers, podman, installing, installation, windows]
---

# Installing Podman on Windows with Podman Desktop

On Windows, running the Podman container engine requires running a Linux distribution on a virtual machine.

Podman Desktop can assist you to install the Podman container engine on the Windows Subsystem for Linux version 2 (WSL 2).
Main benefits are:

* Ease of use
* Windows native virtualization performance

#### Prerequisites

* 6 GB RAM
* No VPN
* User with administrator privileges
* Windows 10 Build 18362 or greater, or Windows 11
* Windows 64bit
* [Hyper-V enabled](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v)
* WSL 2 feature enabled, but no Linux virtual machine created. See [Installing WSL 2, step 1 to 5](https://docs.microsoft.com/en-us/windows/wsl/install-manual)
* Podman is not installed

#### Procedure

1. The **Home** screen displays *Podman Desktop was not able to find an installation of Podman*. Click on **Install**.

   ![img1](../img/windows/homescreen.png)

2. Podman Desktop checks the prerequites to install Podman Engine. When necessary, follow the instructions to install prerequisites.

3. Podman displays the dialog: *Podman is not installed on this system, would you like to install Podman?*. Click on `Yes` to install Podman.

4. Click on **Initialize Podman**.

#### Additional resources

* [Understanding WSL 2](https://learn.microsoft.com/en-us/windows/wsl/about#what-is-wsl-2).
* If your environment doesn't allow you to meet the prerequisites, consider [installing Podman with OpenShift Local](installing-podman-with-openshift-local)

#### Next steps

* [Getting Started with Podman Desktop](/docs/getting-started/getting-started)
