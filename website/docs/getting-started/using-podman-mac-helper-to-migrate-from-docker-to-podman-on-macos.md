---
id: using-podman-mac-helper-to-migrate-from-docker-to-podman-on-macos.md
title: Using the `podman-mac-helper` tool on macOS
description: Using the `podman-mac-helper` tool can make it easier to migrate from Docker to Podman on macOS, as it allows you to continue using familiar Docker commands while taking advantage of the benefits of Podman.
tags: [podman-desktop, getting-started, podman-mac-helper, macOS]
keywords: [podman desktop, podman, containers]
---

## Using the `podman-mac-helper` tool to migrate from Docker to Podman on macOS

The `podman-mac-helper` tool provides a compatibility layer that allows you to use most Docker commands with Podman on macOS.
The service redirects `/var/run/docker` to the fixed user-assigned UNIX socket location.

Using the `podman-mac-helper` tool can make it easier to migrate from Docker to Podman on macOS.
It allows you to continue using familiar Docker commands while taking advantage of the benefits of Podman.

#### Prerequisites

* macOS
* [Podman](../Installation/macos-install)
* [Homebrew](https://brew.sh/)

#### Procedure

1. Save your existing Docker containers by running the command:

    ```
    $ docker save <your_container> > <your_container_archive>.tar
    ```

2. Disable or uninstall the Docker service.

3. Install the `podman-mac-helper` tool.
   Run the command:

    ```
    $ brew install podman-mac-helper
    ```

4. Set up the `podman-mac-helper` service for each user.
   Run the command:

    ```
    $ podman-mac-helper setup
    ```

5. Import your existing containers into Podman.
   Run the command for each container archive:

     ```
     $ podman import <your_container_archive>.tar
     ```

6. Use the `podman-mac-helper` tool to run commands.
   To run a command with Podman by using the `podman-mac-helper` tool, prefix the command with `podman-mac-helper`.

   Example:

    ```
    $ podman-mac-helper run -it <your_container> bash
    ```

#### Additional resources

* [`podman-mac-helper` source](https://github.com/containers/podman/tree/main/cmd/podman-mac-helper)
* [`docker save` reference documentation](https://docs.docker.com/engine/reference/commandline/save/)
* [`podman import` reference documentation](https://docs.podman.io/en/latest/markdown/podman-import.1.html)

