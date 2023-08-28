---
sidebar_position: 3
title: Using `podman-mac-helper` on macOS
description: Using the `podman-mac-helper` tool can make it easier to migrate from Docker to Podman on macOS, as it allows you to continue using familiar Docker commands while taking advantage of the benefits of Podman.
keywords: [podman desktop, podman, containers, migrating, docker, macos]
tags: [migrating-from-docker, mac0S]
---

# Using the `podman-mac-helper` tool to migrate from Docker to Podman on macOS

Consider using `podman-mac-help` to migrate transparently to Podman on macOS.

- Continue using familiar Docker commands.
- Take advantage of the benefits of Podman on macOS.
- Your tools, such as [Maven](https://maven.apache.org/) or [Testcontainers](https://www.testcontainers.org/), communicate with Podman without reconfiguration.

The `podman-mac-helper` tool provides a compatibility layer that allows you to use most Docker commands with Podman on macOS.
The service redirects `/var/run/docker` to the fixed user-assigned UNIX socket location.

#### Prerequisites

- macOS
- [Podman](../Installation/macos-install)
- Docker service is [paused](https://docs.docker.com/desktop/use-desktop/pause/) and [_Start Docker Desktop when you log in_ is disabled](https://docs.docker.com/desktop/settings/mac/), or Docker is [uninstalled](https://docs.docker.com/desktop/uninstall/).

#### Procedure

1. To set up the `podman-mac-helper` service: run the command in a terminal:

   ```shell-session
   sudo podman-mac-helper install
   ```

1. To restart your Podman machine: go to **<icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources**, and in the Podman tile, click <icon icon="fa-solid fa-repeat" size="lg" />.

#### Verification

1. The Docker socket is a symbolic link for the Podman socket:

   ```shell-session
   $ ls -la /var/run/docker.sock
   ```

2. The `docker` CLI communicates with the Podman socket.
   Therefore this command outputs Podman version rather that Docker version:

   ```shell-session
   $ DOCKER_HOST=unix:///var/run/docker.sock docker info --format=json | jq -r .ServerVersion
   ```

3. Your tools communicating to the Docker socket, such as [Maven](https://maven.apache.org/) or [Testcontainers](https://www.testcontainers.org/), communicate with Podman without reconfiguration.

#### Additional resources

- [`podman-mac-helper` source](https://github.com/containers/podman/tree/main/cmd/podman-mac-helper)
- [`docker save` reference documentation](https://docs.docker.com/engine/reference/commandline/save/)
- [`podman import` reference documentation](https://docs.podman.io/en/latest/markdown/podman-import.1.html)
