---
sidebar_position: 60
title: Accessing Podman from another WSL distribution
description: On Windows, access your Podman Desktop containers from another Windows Subsystem for Linux (WSL) distribution.
---

# Accessing Podman from another WSL distribution

On Windows, [Podman Desktop creates a Windows Subsystem for Linux (WSL) virtual machine: the Podman Machine](/docs/podman/creating-a-podman-machine.md).
It also configures the Windows Podman client to communicate with the Podman Machine.
However, it does not configure your other WSL distributions.

You might have other WSL distributions running, and want to access from there to your Podman Desktop containers.

This tutorial focuses on the most common context to walk you through the steps to configure your WSL distribution:

- Ubuntu distribution of Linux.
- Default Podman Machine.

In foldable details, you can find alternative steps for least common contexts:

- Custom WSL distribution.
- Custom Podman Machine.

## Configuring your WSL distribution

1. Start a session in your WSL distribution:

   ```shell-session
   > wsl
   ```

1. To communicate with the remote Podman Machine, you need a Podman client.

   To benefit from the latest features, such as `podman kube` subcommands, and to enable the remote mode by default, consider installing the `podman-remote` binary rather than the `podman` package from the distribution.

   Download the `podman-remote` binary from the [Podman releases page](https://github.com/containers/podman/releases/latest).

1. By default, the Podman client in your WSL distribution communicates with the local Podman.
   It should rather communicate with the remote Podman machine defined by Podman Desktop.

   Configure the Podman client in your WSL distribution to communicate with the remote Podman machine defined by Podman Desktop.

   This will ensure consistency when you are working with Podman from all your different environments

   Set the default Podman system connection to your Podman Machine:

   ```shell-session
   $ podman system connection add --default podman-machine-default-root unix:///mnt/wsl/podman-sockets/podman-machine-default/podman-root.sock
   ```

   <details>
   <summary>
   On a custom Podman Machine, the remote Podman Machine destination might be different.

   Find your Podman Machine name and connection path:
   </summary>
   <div>

   1. Identify the sockets available in your WSL distribution.

      The Podman machine shares sockets in a `/mnt/wsl/podman-sockets/` subdirectory named after the Podman machine name.

      In your WSL session, list the available sockets:

      ```shell-session
      $ find /mnt/wsl/podman-sockets/ -name '*.sock'
      ```

      Each Podman Machine has a socket for:

      - Rootful Podman: `podman-root.sock`
      - Rootless Podman: `podman-user.sock`

      Sample output:

      ```shell-session
      /mnt/wsl/podman-sockets/podman-machine-default/podman-root.sock
      /mnt/wsl/podman-sockets/podman-machine-default/podman-user.sock
      ```

   2. Identify the socket that Podman Desktop uses.

      Podman Desktop defaults to rootful Podman.
      However, consider identifying the active socket.

      The active socket is the default Podman system connection in your Windows session.

      Open a new Command Prompt, and list your Podman system connections:

      ```shell-session
      > podman system connection list
      ```

      The default connection line ends with `true`.

      Identify your Podman Machine socket by its URI in Windows:

      - Rootful Podman: `ssh://root@127.0.0.1:59292/run/podman/podman.sock`
      - Rootless Podman: `ssh://user@127.0.0.1:59292/run/user/1000/podman/podman.sock`

      Sample output:

      ```shell-session
      Name                         URI                                                          Identity                                                  Default

      podman-machine-default ssh://user@127.0.0.1:59292/run/user/1000/podman/podman.sock C:\Users\Podman Desktop User\.ssh\podman-machine-default false
      podman-machine-default-root ssh://root@127.0.0.1:59292/run/podman/podman.sock C:\Users\Podman Desktop User\.ssh\podman-machine-default true
      ```

   3. To define the Podman machine remote destination, prepend with `unix://` the socket path that is available in your WSL, and corresponds to the Podman Desktop active socket:

      For the default Podman machine:

      - Rootful Podman: `unix:///mnt/wsl/podman-sockets/podman-machine-default/podman-root.sock`
      - Rootless Podman: `unix:///mnt/wsl/podman-sockets/podman-machine-default/podman-user.sock`

   </div>
   </details>

1. Podman requires you to actively confirm that you want to use a remote connection with the `--remote` flag.

   To always enable the remote connection, edit the `~/.config/containers/containers.conf`, and add the section:

   ```toml
   [engine]
   remote=true
   ```

1. The communication channel between your WSL distribution and the Podman Machine is a special file (a socket).
   The Podman Machine creates this file with specific permissions.
   To communicate with the Podman Machine from your WSL distribution your user must have write permissions for the socket.

   To give access to the remote Podman machine to your user: create the group if necessary, assign group membership, and exit your session on the WSL distribution to apply the new group membership:

   ```shell-session
   $ sudo usermod --append --groups 10 $(whoami)
   $ exit
   ```

## Testing the connection

Verify that, on your WSL distribution, the Podman CLI communicates with your Podman machine.

1. Start a session in your WSL distribution:

   ```shell-session
   > wsl
   ```

1. Verify that your user is member of the group delivering access to the remote Podman Machine socket:

   ```shell-session
   $ groups
   ```

   On the default Ubuntu WSL, the list contains the `uucp` group.

   <details>
   <summary>
   On a custom WSL distribution, the group name might be different.

   Find the required group name:
   </summary>
   <div>
   The required group id is the same on any WSL distribution.

   However, the group name might be different on a custom WSL distribution.

   On the Podman Machine, which runs on a Fedora distribution:

   - Rootful Podman: GID `10` name is `wheel`.
   - Rootless Podman: GID `1000` name is `user`.

   On the Ubuntu distribution:

   - Rootful Podman: GID `10` name is `uucp`.
   - Rootless Podman: GID `1000` name is the same as the user name you chose when creating the WSL machine.

   On a custom WSL distribution, find the group name for:

   - Rootful Podman:

     ```shell-session
     $ getent group 10
     ```

   - Rootless Podman:

     ```shell-session
     $ getent group 1000
     ```

   </div>
   </details>

1. Verify that Podman default system connections is set to your remote Podman machine:

   ```shell-session
   $ podman system connection list
   ```

1. Verify that Podman has a `Server` version corresponding to your Podman Machine version:

   ```shell-session
   $ podman version
   ```

   Sample output:

   ```shell-session
   Client:
   Version:      3.4.4
   API Version:  3.4.4
   Go Version:   go1.18.1
   Built:        Thu Jan 1 01:00:00 1970
   OS/Arch:      linux/amd64

   Server:
   Version:      4.8.3
   API Version:  4.8.3
   Go Version:   go1.21.5
   Built:        Wed Jan 3 15:11:40 2024
   OS/Arch:      linux/amd64
   ```

   :::info

   On your environment, the Podman version might be different.

   :::

1. Verify that you can list running containers.

   [On the Podman Desktop graphical interface, start a container such as `quay.io/podman/hello`](/docs/containers/starting-a-container).

   On your WSL distribution, list running containers:

   ```shell-session
   $ podman ps -a
   ```

   The output lists the same containers that you see on Podman Desktop graphical interface.

## Next steps

- From your WSL distribution, [work with containers](/docs/containers).
