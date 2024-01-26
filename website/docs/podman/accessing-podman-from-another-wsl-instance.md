---
sidebar_position: 60
title: Accessing Podman from another WSL distribution
description: On Windows, access your Podman Desktop containers from another Windows Subsystem for Linux (WSL) distribution.
---

# Accessing Podman from another WSL distribution

On Windows, [Podman Desktop configures Podman in a dedicated Windows Subsystem for Linux (WSL) distribution: the Podman Machine](/docs/podman/creating-a-podman-machine.md).
It also configures the Windows Podman client to communicate with the Podman Machine.
However, it does not configure your other WSL distributions.

You might have other WSL distributions running, and want to access from there to your Podman Desktop containers.

This tutorial focuses on the most common context to walk you through the steps to configure your WSL distribution:

- Ubuntu distribution of Linux.
- Default Podman Machine.

In foldable details, you can find alternative steps for least common contexts:

- Custom WSL distribution.
- Custom Podman Machine.

## Installing the Podman client

To communicate with the remote Podman Machine, you need a Podman client.
On your WSL distribution, install the Podman client package.

1. Start a session in your WSL distribution:

   ```shell-session
   > wsl
   ```

1. Install the Podman client:

   ```shell-session
   $ sudo apt update
   $ sudo apt install podman
   ```

   The package might set up local Podman resources.
   However, you plan not to use them.

   :::tip

   When the Podman client is already installed, you might skip this step.

   :::

   :::info

   On a custom WSL distribution, the installation step might be different.
   See [Installing Podman on Linux](https://podman.io/docs/installation#installing-on-linux).

   :::

1. Display Podman version:

   ```shell-session
   $ podman version
   ```

   Sample output:

   ```shell-session
   Version:      3.4.4
   API Version:  3.4.4
   Go Version:   go1.18.1
   Built:        Thu Jan 1 01:00:00 1970
   OS/Arch:      linux/amd64
   ```

   :::info

   On a custom WSL distribution, the Podman version might be different.

   :::

## Giving access to the Podman Machine defined by Podman Desktop

The communication channel between your WSL distribution and the Podman Machine is a special file (a socket).
The Podman Machine creates this file with specific permissions.
On your WSL distribution, to communicate with the Podman Machine, your user must have the write permissions on this file.

To give access to the remote Podman machine to your user, assign group membership.

1. Start a session in your WSL distribution:

   ```shell-session
   > wsl
   ```

1. Add your user to the `10` group:

   ```shell-session
   $ sudo usermod --append --groups 10 your_user
   ```

1. Exit to apply the new group membership:

   ```shell-session
   $ exit
   ```

1. Start a new WSL session:

   ```shell-session
   > wsl
   ```

1. List your user groups:

   ```shell-session
   $ groups
   ```

   On the default Ubuntu WSL, the `uucp` group is in the list.

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
     $ grep :10: /etc/group
     ```

   - Rootless Podman:

     ```shell-session
     $ grep :1000: /etc/group
     ```

   </div>
   </details>

## Assigning the Podman machine destination

By default, the Podman client in your WSL distribution communicates with the local Podman.
It should rather communicate with the remote Podman machine defined by Podman Desktop.

Configure the Podman client in your WSL distribution to communicate with the remote Podman machine defined by Podman Desktop.

This will ensure consistency when you are working with Podman from all your different environments

1. Start a session in your WSL distribution:

   ```shell-session
   > wsl
   ```

1. Set the default Podman system connection to your Podman Machine:

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

1. List the Podman system connections:

   ```shell-session
   $ podman system connection list
   ```

   The list displays your remote Podman Machine **Name** and **URI**.

1. Podman requires you to actively confirm that you want to use a remote connection.

   To always enable the remote connection, set an alias:

   ```shell-session
   $ alias podman='podman --remote'
   ```

   :::tip

   On a custom WSL distribution with a Podman client version 4, you might skip this step.

   :::

## Testing the connection to the remote Podman machine

On your WSL distribution, the Podman CLI communicates with your Podman machine.

1. On your WSL distribution, the Podman version displays a `Client` and a `Server` version:

   ```shell-session
   $ podman version
   ```

   The Server version corresponds to your Podman Machine version.

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

1. [From the Podman Desktop graphical interface, start a container such as `quay.io/podman/hello`](/docs/containers/starting-a-container).

1. To verify the connection, on your WSL distribution, list running containers:

   ```shell-session
   $ podman ps -a
   ```

   The output lists the same containers that you see on Podman Desktop graphical interface.

## Next steps

- From your WSL distribution, [work with containers](/docs/containers).
