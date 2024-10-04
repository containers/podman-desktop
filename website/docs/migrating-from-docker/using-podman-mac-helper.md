---
sidebar_position: 3
title: Using `podman-mac-helper` on macOS
description: Using the `podman-mac-helper` tool can make it easier to migrate from Docker to Podman on macOS, as it allows you to continue using familiar Docker commands while taking advantage of the benefits of Podman.
keywords: [podman desktop, podman, containers, migrating, docker, macos]
tags: [migrating-from-docker, mac0S]
---

# Using the `podman-mac-helper` tool to migrate from Docker to Podman on macOS

Consider using `podman-mac-helper` to migrate transparently to Podman on macOS.

- Continue using familiar Docker commands.
- Take advantage of the benefits of Podman on macOS.
- Your tools, such as [Maven](https://maven.apache.org/) or [Testcontainers](https://www.testcontainers.com/), communicate with Podman without reconfiguration.

The `podman-mac-helper` tool provides a compatibility layer that allows you to use most Docker commands with Podman on macOS.
The service redirects `/var/run/docker` to the fixed user-assigned UNIX socket location.

#### Prerequisites

- macOS
- [Podman](/docs/installation/macos-install)
- Docker service is [paused](https://docs.docker.com/desktop/use-desktop/pause/) and [_Start Docker Desktop when you log in_ is disabled](https://docs.docker.com/desktop/settings/mac/), or Docker is [uninstalled](https://docs.docker.com/desktop/uninstall/).

#### Procedure

1. Set up the `podman-mac-helper` service: run the command in a terminal:

   ```shell-session
   sudo podman-mac-helper install
   ```

1. Restart your Podman machine: go to **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources**, and in the Podman tile, click <Icon icon="fa-solid fa-repeat" size="lg" />.

#### Verification

1. The Docker socket is a symbolic link for the Podman socket:

   ```shell-session
   $ ls -la /var/run/docker.sock
   ```

   The output points to a `podman.sock` file such as:

   ```shell-session
   /var/run/docker.sock -> /Users/username/.local/share/containers/podman/machine/podman.sock
   ```

1. When you query the Docker socket, you receive replies from Podman rather than Docker.

   For instance, this command outputs Podman version rather that Docker version:

   ```shell-session
   $ curl -s --unix-socket /var/run/docker.sock "http://v1.41/info"  | jq -r .ServerVersion
   ```

1. Your tools communicating to the Docker socket, such as [Maven](https://maven.apache.org/) or [Testcontainers](https://www.testcontainers.com/), communicate with Podman without reconfiguration.

1. (Optionally, if the `docker` CLI is installed) The docker CLI context is set to the default value `unix:///var/run/docker.sock`:

   ```shell-session
   $ docker context list
   NAME       TYPE  DESCRIPTION                              DOCKER ENDPOINT             KUBERNETES ENDPOINT  ORCHESTRATOR
   default *  moby  Current DOCKER_HOST based configuration  unix:///var/run/docker.sock
   ```

1. (Optionally, if the `docker` CLI is installed) The `docker` CLI communicates with the Podman socket.

   Therefore this command outputs Podman version rather that Docker version:

   ```shell-session
   $ docker info --format=json | jq -r .ServerVersion
   ```

#### Additional resources

- [`podman-mac-helper` source](https://github.com/containers/podman/tree/main/cmd/podman-mac-helper)
