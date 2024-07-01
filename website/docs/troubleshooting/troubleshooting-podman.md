---
sidebar_position: 10
title: Podman
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
After each step, quit and restart Podman Desktop to ensure that it can detect your Podman installation.

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

1. If the creation fails, read the logs carefully to continue troubleshooting.

## Podman Desktop fails starting a Podman machine

#### Issue

Podman Desktop might fail starting a Podman machine.

#### Workaround

1. In a terminal, start the Podman machine with the Podman CLI:

   ```shell-session
   $ podman machine start
   ```

1. If the creation fails, read the logs carefully to continue troubleshooting.

## Podman Desktop fails listing images or containers

Podman Desktop might fail listing images or container.

#### Prerequisites

- Podman 4.1.0 or later is needed. Podman Desktop requires the Podman machine to expose the socket on the host for macOS, and on a named pipe for Windows

#### Procedure

1. On Windows and macOS: in a terminal, verify that at least one Podman machine is running:

   ```shell-session
   $ podman machine list
   ```

1. To verify you can connect by using the CLI, in a terminal, run the `hello` container:

   ```shell-session
   $ podman run quay.io/podman/hello
   ```

## Podman Desktop fails listing containers

#### Issue

Podman Desktop might display "No Containers" as shown below, even if there are active containers running in the background.
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

## Podman Desktop is failing to display the images or containers from a rootful Podman machine

The rootful configuration for a Podman machine depends on the Podman machine default connection.
The default connection can be modified by external events, or when creating a new Podman machine.
Podman Desktop might then reconnect in rootless mode, and fail to display the images or containers.

#### Workaround

1. Verify that the Podman default connection is the rootful connection to your Podman machine:

   ```shell-session
   $ podman system connection ls
   ```

   The default connection has `true` at the end of the line.

   The rootful connection has a `-root` name suffix, and a `ssh://root@` URI prefix.

   Example default rootful connection:

   ```shell-session
   Name                        URI                                                         Identity                                      Default
   podman-machine-default      ssh://user@127.0.0.1:54826/run/user/1000/podman/podman.sock c:\Users\username\.ssh\podman-machine-default false
   podman-machine-default-root ssh://root@127.0.0.1:54826/run/podman/podman.sock           c:\Users\username\.ssh\podman-machine-default true
   ```

   Example default rootless connection:

   ```shell-session
   Name                        URI                                                         Identity                                      Default
   podman-machine-default      ssh://user@127.0.0.1:54826/run/user/1000/podman/podman.sock c:\Users\username\.ssh\podman-machine-default true
   podman-machine-default-root ssh://root@127.0.0.1:54826/run/podman/podman.sock           c:\Users\username\.ssh\podman-machine-default false
   ```

   Continue with the next steps only if the default connection is not the rootful connection to your Podman machine.

1. Set the Podman machine in rootful mode:

   ```shell-session
   $ podman machine set --rootful
   ```

1. Restart the Podman machine:

   ```shell-session
   $ podman machine stop
   $ podman machine start
   ```

1. Verify that Podman default connection points to the rootful connection:

   ```shell-session
   $ podman system connection ls
   ```

   Continue with the next steps only if the default connection is not the rootful connection to your Podman machine.

1. Set the Podman machine, such as `podman-machine-default` in rootful mode:

   ```shell-session
   $ podman system connection default podman-machine-default-root
   ```

1. Restart the Podman machine:

   ```shell-session
   $ podman machine stop
   $ podman machine start
   ```

#### Verification

1. The Podman default connection is the rootful connection to your Podman machine:

   ```shell-session
   $ podman system connection ls
   ```

## Warning about Docker compatibility mode

#### Issue

When running the Podman provider, a warning shows regarding Docker compatibility mode on the dashboard:

```<!-- markdownlint-disable MD040 -->
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

_Note:_ If Docker Desktop is started again, it will automatically re-alias the default Docker socket location and the Podman compatibility warning will re-appear.
