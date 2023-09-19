---
sidebar_position: 11
title: Custom Podman machine
description: Podman Desktop can assist you to create custom Podman machine on Windows and macOS.
tags: [podman-desktop, podman, installing, windows, macOS]
keywords: [podman desktop, containers, podman, installing, installation, windows, macos, podman machine]
---

# Creating a Podman machine with Podman Desktop

On macOS and Windows, running the Podman container engine requires running a Linux virtual machine.

By default, Podman Desktop initializes a Podman machine with a standard configuration.

Consider creating a custom Podman machine to:

- Control the assigned resources: CPUs, memory, and disk size.
- Use a custom boot image.
- Use the rootful connection by default, for example to run Kind.
- (On Windows) Route the traffic through the network connection from your Windows session.

#### Prerequisites

- The Podman executable is installed.

#### Procedure

1. Go to **Settings > Resources**.
1. In the **Podman** tile, click **Create new**.
1. In the **Create a Podman machine** screen:

   1. **Name**:
      Enter a name, such as `podman-machine-default`.
   1. **CPU(s)**:
      Select the number of CPUs.
   1. **Memory**:
      Select the memory size.
   1. **Disk size**:
      Select the disk size.
   1. **Image path (Optional)**:
      Select a bootable image containing a virtual machine with Podman.
   1. **Machine with root privileges**:
      Enable to use the rootful connection by default.
      Required to use Kind on Windows.
   1. (On Windows) **User mode networking (traffic relayed by a user process)**:
      Enable to route the traffic through the network connection from your Windows session.
      Required to access resources behind your VPN connection.
   1. Click **Create**

   ![Create a Podman machine](img/create-a-podman-machine.png)
