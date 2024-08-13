---
sidebar_position: 21
title: Remote access
description: Podman Desktop can access remote instances of Podman.
tags: [podman, installing, windows, macOS]
keywords: [podman desktop, containers, podman, remote]
---

# Remote access

Podman Desktop can manage remote Podman connections. This is facilitated through a list of connections using the command `podman system connection ls`.

Containers can be created, started, stopped, and deleted as if managed locally.

This functionality is enabled by connecting via SSH to the Podman socket on the remote host.

**Ed25519** keys, an **SSH** connection, and an enabled **Podman Socket** are required for remote access.

RSA keys are _not supported_; Ed25519 keys are the recommended and only current method to set up a remote connection.

#### Prerequisites

- SSH access to a Linux machine with Podman installed

#### Procedure

1. Enable Podman Remote in the Podman **Settings**:

![Enable the remote setting](img/remote.png)

2. Generate a local Ed25519 key:

```sh
$ ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519
```

3. Copy your **public** Ed25519 key to the server:

Your public SSH key needs to be copied to the `~/.ssh/authorized_keys` file on the Linux server:

```sh
$ ssh-copy-id -i ~/.ssh/id_ed25519.pub user@my-server-ip
```

4. Enable the Podman socket on the remote connection:

By default, the podman.socket is **disabled** in Podman installations. Enabling the systemd socket allows remote clients to control Podman.

```sh
$ systemctl enable podman.socket
$ systemctl start podman.socket
```

5. Add the connection to `podman system connection ls`:

It's important to know which socket path you are using, as this varies between regular users and root.

Use `podman info` to determine the correct socket path:

```sh
$ ssh user@my-server-ip podman info | grep sock
   path: /run/user/1000/podman/podman.sock
```

If you are using root, it may appear as:

```sh
$ ssh root@my-server-ip podman info | grep sock
   path: /run/podman/podman.sock
```

Now you are ready to add the connection. Add it with a distinct name to the Podman system connection list:

```sh
# non-root
$ podman system connection add my-remote-machine --identity ~/.ssh/id_ed25519 ssh://myuser@my-server-ip/run/user/1000/podman/podman.sock

# root
$ podman system connection add my-remote-machine --identity ~/.ssh/id_ed25519 ssh://root@my-server-ip/run/podman/podman.sock
```

6. Check within Podman Desktop such as the **Containers** section that you can now access your remote instance.

#### Verification

**GUI verification:**

1. Run a helloworld container on the remote machine:

```sh
$ ssh user@my-server-ip podman run -d quay.io/podman/hello
```

2. Within Podman Desktop, check that your container appears in the **Containers** section.

**CLI verification:**

1. Set your remote connection as the default:

```sh
$ podman system connection default my-remote-machine
```

2. Verify that the container appears in the CLI:

```sh
$ podman ps
```

#### Additional resources

- https://github.com/containers/podman/blob/main/docs/tutorials/remote_client.md
