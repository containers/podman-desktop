---
sidebar_position: 3
title: Configuring Podman for Kind
description: Configuring Podman for Kind on Windows Subsystem for Linux (WSL).
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Configuring Podman for Kind on Windows Subsystem for Linux (WSL)

When you create a Podman machine, Podman creates two system connections:

* The default rootless connection.
* A rootful connection, which has a `-root` suffix.

With a Podman machine running on WSL, Kind:

* Uses the default Podman connection.
* Requires the rootful connection.

Therefore, set the Podman machine default connection to rootful.

#### Procedure

1. List the Podman system connections:

   ```shell-session
   $ podman system connection ls
   ```

2. Set the Podman system default connection to connection that has the `-root` suffix:

   ```shell-session
   $ podman system connection default podman-machine-default-root
   ```
