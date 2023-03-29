---
sidebar_position: 3
title: Using `podman-mac-helper` on macOS
description: Using the `podman-mac-helper` tool can make it easier to migrate from Docker to Podman on macOS, as it allows you to continue using familiar Docker commands while taking advantage of the benefits of Podman.
keywords: [podman desktop, podman, containers, migrating, docker, macos]
tags: [migrating-from-docker, mac0S]
---

# Using the `podman-mac-helper` tool to migrate from Docker to Podman on macOS

Consider using `podman-mac-help` to migrate transparently to Podman on macOS.

* Continue using familiar Docker commands.
* Take advantage of the benefits of Podman on macOS.
* Your tools, such as [Maven](https://maven.apache.org/) or [Testcontainers](https://www.testcontainers.org/), communicate with Podman without reconfiguration.

The `podman-mac-helper` tool provides a compatibility layer that allows you to use most Docker commands with Podman on macOS.
The service redirects `/var/run/docker` to the fixed user-assigned UNIX socket location.

#### Prerequisites

* macOS
* [Podman](../Installation/macos-install)
* Docker service is [paused](https://docs.docker.com/desktop/use-desktop/pause/) and [*Start Docker Desktop when you log in* is disabled](https://docs.docker.com/desktop/settings/mac/), or Docker is [uninstalled](https://docs.docker.com/desktop/uninstall/).

#### Procedure

* Set up the `podman-mac-helper` service for each user.
   Run the command:

    ```sh
    sudo podman-mac-helper install
    ```

    For additional install options please run the command:

    ```sh
    sudo podman-mac-helper install --help
    ```


#### Verification

1. Your tools communicating to the Docker socket, such as [Maven](https://maven.apache.org/) or [Testcontainers](https://www.testcontainers.org/), communicate with Podman without reconfiguration.

2. Use the `podman-mac-helper` tool to run commands.
   To run a command with Podman by using the `podman-mac-helper` tool, prefix the command with `podman-mac-helper`.

   Example:

    ```
    $ podman-mac-helper run -it <your_container> bash
    ```

#### Additional resources

* [`podman-mac-helper` source](https://github.com/containers/podman/tree/main/cmd/podman-mac-helper)
* [`docker save` reference documentation](https://docs.docker.com/engine/reference/commandline/save/)
* [`podman import` reference documentation](https://docs.podman.io/en/latest/markdown/podman-import.1.html)

