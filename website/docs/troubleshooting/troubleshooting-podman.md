---
sidebar_position: 10
title: Troubleshooting Podman
description: How to investigate when Podman does not work as expected.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Troubleshooting Podman

## Podman Desktop does not find your Podman installation

#### Issue

To install Podman, you can choose between multiple installation methods:

- Install from Podman Desktop.
- Podman installer.
- Operating system specific installer: Brew, Chocolatey, Scoop, Winget.
- Installer for restricted environment.

Podman Desktop might fail to detect your Podman installation.

#### Solution

Try following steps to verify your Podman installation.
After each step, quit and restart Podman Desktop to verify Podman Desktop can detect your Podman installation.

1. In a terminal, verify you can access the Podman CLI, and verify the version.

   ```shell-session
   $ podman version
   ```

1. Update Podman to the latest stable version by using your installation method.
1. Search for errors in the installation logs (if your installation method is providing logs).
1. Reinstall Podman with the same installation method.
1. Reinstall Podman with the Podman Desktop installer.
1. Reinstall Podman with the Podman installer.
1. Reinstall Podman with another method.

## Podman Desktop fails creating a Podman machine

#### Issue

Podman Desktop might fail creating a Podman machine.

#### Workaround

1. In a terminal, create the Podman machine with the Podman CLI:

   ```shell-session
   $ podman machine init
   ```

1. If the creation fails, read carefully the logs to continue troubleshooting.

## Podman Desktop fails starting a Podman machine

#### Issue

Podman Desktop might fail starting a Podman machine.

#### Workaround

1. In a terminal, start the Podman machine with the Podman CLI:

   ```shell-session
   $ podman machine start
   ```

1. If the operation fails, read carefully the logs to continue troubleshooting.

## Podman Desktop fails listing images or containers

Podman Destkop might fail listing images or container.

#### Prerequisites

- Podman 4.1.0 or greater. Podman Desktop requires the Podman machine to expose the socket on the host on macOS, and on a named pipe on Windows.

#### Procedure

1. On Windows and macOS: in a terminal, verify that at least one Podman machine is running:

   ```shell-session
   $ podman machine list
   ```

1. To verify you can connect by using the CLI, in a terminal, run the `hello` container:

   ```shell-session
   $ podman run quay.io/podman/hello
   ```

## Podman Destkop fails listing containers

#### Issue

Podman Desktop might be displaying "No Containers" as shown below despite active containers runnning in the background.
![img](../img/containers_error.png)

#### Solution

1. Stop and restart Podman Desktop.
1. In Podman Desktop, restart the Podman machine.

1. In a terminal, restart the Podman machine:

   ```shell-session
   $ podman machine stop
   $ podman machine start
   ```

1. If the previous step did not work for you, delete your Podman machine, and create a new one:

   ```shell-session
   $ podman machine rm
   $ podman machine init
   ```

1. If the previous steps did not work for you, delete your Podman configuration files, and create a new Podman machine:

   ```shell-session
   $ rm -rf ~/.local/share/containers/podman
   $ rm -rf ~/.config/containers/
   $ podman machine init
   ```

## Warning about Docker compatibility mode

#### Issue

When running the Podman provider, a warning shows regarding Docker compatibility mode on the dashboard:

```
⚠️ Docker Socket Compatibility: Podman is not emulating the default Docker socket path: '/var/run/docker.sock'. Docker-specific tools may not work. See troubleshooting page on podman-desktop.io for more information.
```

This might appear when either:

- The Docker socket is not mounted correctly.
- Docker Desktop is also being ran at the same time.

#### Solution

1. Stop Docker Desktop (if installed).
2. On macOS, Run the `podman-mac-helper` binary:

   ```shell-session
   $ sudo podman-mac-helper install
   ```

3. Restart the Podman machine to recreate and activate the default Docker socket path.

_Note:_ If Docker Desktop is started again, it will automatically re-alias the default Docker socket location and the Podman compatibilty warning will re-appear.
