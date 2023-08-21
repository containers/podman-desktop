---
sidebar_position: 5
title: Podman behind a VPN on Windows
description: Accessing resources behind a VPN with Podman on Windows
tags: [podman, vpn, windows]
keywords: [podman, vpn, windows]
---

# Accessing resources behind a VPN with Podman on Windows

On Windows, when Podman requires to access resources that are behind a user-controlled VPN, enable the user mode networking in your Podman machine.

#### Prerequisites

- Windows host with updated WSL2.
- Podman 4.6.0 or greater.

#### Procedure

1. To enable user mode networking, when creating the Podman machine, select the **User mode networking (traffic relayed by a user process).** option.

2. SSH to the Podman machine

   ```shell-session
   $ podman machine ssh *<podman_machine_name>*
   ```

3. Create and edit the `/etc/resolv.conf` file:

   ```
   nameserver 1.1.1.1
   nameserver 8.8.8.8
   ```

4. Create and edit the `/mnt/wsl/wsl.conf` file:

   ```ini
   [network]
   generateResolvConf = false
   ```

5. Exit the Podman machine SSH session.

   ```shell-session
   $ exit
   ```

#### Verification

- You can access resources that are behind the VPN.
