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

#### Verification

- You can access resources that are behind the VPN.
