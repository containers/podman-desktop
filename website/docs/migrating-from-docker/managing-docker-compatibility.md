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

- Check the socket mapping status along with socket details, such as client name, Docker version, and OS/Arch.
- Use all Docker commands with Podman. For example, you can use the `podman run` command in place of `docker run` command to start a container.
- Use Docker Compose commands with Podman by installing and setting up the [Compose extension](/docs/compose). For example, you can use the `podman compose up` command in place of `docker compose up` command to start your Docker application. You can place your Docker Compose file in a _/var/compose/_ directory so that Podman can access it. If the Compose CLI is not installed, you get the install option in the **Docker Compatibility** settings.
- Use third-party Docker tools, such as Maven or Testcontainers with the Podman engine without any reconfiguration. These tools connect to the default Podman socket. By default, third-party Docker tool compatibility is enabled on macOS.
- Select and use a Docker-compatible socket context. You can also view the socket details, such as name and socket path.

#### Prerequisites

- [A running Podman machine](/docs/podman/creating-a-podman-machine)

#### Procedure

1. Go to **Settings > Docker Compatibility**.
2. **Socket Mapping Status** setting: View the socket mapping status to check whether the socket is reachable.
3. **Third-Party Docker Tool Compatibility** setting: Customize the setting, if needed. When enabled, you can use third-party Docker tools with Podman.

   :::note

   This setting is available if you use Podman Desktop on macOS.

   :::

4. **Podman Compose CLI Support** setting: Check whether the Podman Compose CLI is supported. If not, use the **Install** icon to install and set up the Podman CLI.
5. **Docker CLI Context** setting: Select a socket context to work with from the dropdown list.

#### Verification

- Run `podman` or `podman compose` commands for your Docker workload to check if they run fine.
