---
sidebar_position: 20
title: Podman on Windows
description: How to investigate when Podman does not work as expected.
---

# Troubleshooting Podman on Windows

You can find here troubleshooting help for issues specific to Windows.

## Deleting a corrupted Podman Machine

#### Issue

1. You are not able to stop your Podman Machine.

   ```shell-session
   $ podman machine stop
   ```

2. The Logs contain this error:

   ```shell-session
   Error: Error stopping sysd: exit status 1
   ```

#### Workaround

1. To display the active Windows Subsystem for Linux (WSL) distribution list: in the terminal, run:

   ```shell-session
   $ wsl --list
   ```

1. The command returns the list of active WSL distributions. Identify your Podman Machine in the list, such as `podman-machine-default`.

1. To stop, and uninstall your Podman Machine: in the terminal, replace `podman-machine-default` by your Podman machine name, and run:

   ```shell-session
   $ wsl --unregister podman-machine-default
   ```

#### Additional resources

- [WSL documentation: Uninstall a Linux distribution](https://learn.microsoft.com/en-us/windows/wsl/basic-commands#unregister-or-uninstall-a-linux-distribution)

## The terminal session attaches to Podman Desktop when launching it from the command line

#### Issue

1. When you start Podman Desktop from the command line in Windows the terminal session attaches to it.
1. When you quit the terminal, it kills Podman Desktop.

#### Workaround

- Set the environment variable `ELECTRON_NO_ATTACH_CONSOLE` to true before launching Podman Desktop.

## When the host is behind a VPN, Podman cannot access network resources

When the host is behind a VPN, Podman might fail to access network resources, and display errors such as _Temporary failure in name resolution_.

### Solution

See [Accessing resources behind a VPN with Podman on Windows](/docs/proxy/using-a-vpn-on-windows).

## Older WSL versions might lead to networking issues

Older versions of WSL might cause networking issues, such as the `Get-NetTCPConnection` error, indicating that the WSL loopback forwarding facility is not functioning correctly. Recent versions of WSL do not have this issue.

#### Solution

1. Update Windows to either the 21H1, 21H2, or 22H2 version of Windows 10, or to the 21H1 version of Windows 11, or greater.

2. Update WSL:

   ```shell-session
   wsl --update
   ```

3. Optionally, delete your Podman machine, and create a new one.
