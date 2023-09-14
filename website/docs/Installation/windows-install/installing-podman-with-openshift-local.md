---
sidebar_position: 12
title: Installing Podman with OpenShift Local
description: OpenShift Local can assist you to install Podman on Windows.
tags: [openshift-local, podman, installing, windows]
keywords: [podman desktop, containers, podman, installing, installation, windows]
---

# Installing the Podman Preset with OpenShift Local

On Windows, running the Podman container engine requires running a Linux distribution on a virtual machine.

Consider installing the Podman Preset in OpenShift Local rather than [installing Podman with Podman Desktop](installing-podman-with-podman-desktop) when you require one of following:

- No WSL 2
- Full control on the HyperV virtual machine
- User without administrator privileges
- VPN
- Windows 10

#### Prerequisites

- The user is a member of the _Hyper-V Administrators_ group. The user can add a virtual machine, start or stop this virtual machine, and access the resources related to this virtual machine.
- Windows 10 version 1709 or later, Enterprise or Professional edition, or Windows 11, Enterprise or Professional edition

#### Procedure

1. [Install OpenShift Local](https://console.redhat.com/openshift/create/local)

2. Select the Podman container runtime preset:

   ```shell-session
   $ crc config set preset podman
   ```

3. Set up your host machine for Red Hat OpenShift Local:

   ```shell-session
   $ crc setup
   ```

4. Start the Red Hat OpenShift instance:

   ```shell-session
   $ crc start
   ```

#### Additional resources

- [Red Hat OpenShift Local presets](https://access.redhat.com/documentation/en-us/red_hat_openshift_local/2.12/html/getting_started_guide/using_gsg#about-presets_gsg)

#### Next steps

- [Getting Started with Podman Desktop](/docs/getting-started)
