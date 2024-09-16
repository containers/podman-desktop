---
sidebar_position: 5
title: Managing docker compatibility
description: Covers configurations available to manage docker compatibility
keywords: [podman desktop, podman, docker, compatibility]
tags: [managing-docker-compatibility]
---

# Managing docker compatibility

With Podman Desktop, you can configure a Docker-compatible environment to run your Docker applications on a Podman engine, rather than on a Docker engine.

As a developer, you can:

- Set the Docker compatibility mode to emulate a Docker API socket connection to the `var/run/docker.sock` default path.
- Use all Docker commands with Podman. For example, you can use the `podman run` command in place of `docker run` command to start a container.
- Use Docker Compose commands with Podman. For example, you can use the `podman compose up` command in place of `docker compose up` command to start your Docker application. You can place your Docker Compose file in a _/var/compose/_ directory so that Podman can access it.
- Use third-party tools, such as Maven or Testcontainers with the Podman engine without any reconfiguration. These tools can connect to the default Podman socket.
- Set a custom socket path. The default socket path is accessible to any user of the machine. By changing the path, you can restrict access to the socket and secure your Podman configuration.
- Restore the Docker socket mapping to bind the Podman socket under the Docker socket path. For example, you might face a scenario where Podman does not emulate the default socket path and shows a warning to restore the Docker socket mapping in the UI.

:::note

The Docker compatibility mode is enabled by default. However, you can customize the settings, if required.

:::

#### Prerequisites

- [A running Podman machine](/docs/podman/creating-a-podman-machine)

#### Procedure

1. Go to **Settings > Docker Compatibility**.
2. Customize Docker preferences settings:
   - **Docker compatibility mode for Podman**: When enabled, Podman handles all CLI requests coming to the system Docker host.
   - **Docker CLI emulation with Podman**: When enabled, you can run Docker commands.
   - **Docker Compose compatibility**: When enabled, you can run Docker Compose commands.
3. Customize socket mapping settings:
   - Check the status of the Docker-compatible socket whether it is active.
   - Select a custom socket path, if required.
   - Click the **Restore** button to restore the default socket mapping configuration.

#### Verification

- Run `podman` or `podman compose up` commands for your Docker workload to check if they run fine.
