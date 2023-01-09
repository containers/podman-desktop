---
id: using-the-docker_host-environment-variable
title: Using the `DOCKER_HOST` environment variable
description: Using the `DOCKER_HOST` environment variable can make it easier to migrate from Docker to Podman Desktop, as it allows you to continue using familiar Docker commands while taking advantage of the benefits of Podman.
tags: [podman-desktop, getting-started]
keywords: [podman desktop, podman, containers, docker_host, environment, variable]
hide_table_of_contents: false
---

# Using the `DOCKER_HOST` environment variable

Consider using the `DOCKER_HOST` environment variable to migrate transparently from Docker to Podman Desktop on all platforms.

* Continue using familiar Docker commands.
* Take advantage of the benefits of Podman.
* Your tools, such as [Gradle](https://gradle.org/) or [Testcontainers](https://www.testcontainers.org/), communicate with Podman without reconfiguration.

#### Prerequisites

* Podman
* [jq](https://stedolan.github.io/jq/)

#### Procedure

1. Identify the location of your Podman socket:

  
    * On Linux:
   
      ```shell-session
      $ podman info --format json | jq '.host.remoteSocket.path'
      ```

    * On macOS and Windows:

      ```shell-session
      $ podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}'
      ```

2. Set the `DOCKER_HOST` environment variable to your Podman socker location:

    ```shell-session
    $ export DOCKER_HOST=<your_podman_socket_location>
    ```

#### Verification

* Your tools using the `DOCKER_HOST` environment variable, such as [Gradle](https://gradle.org/) or [Testcontainers](https://www.testcontainers.org/), communicate with Podman without reconfiguration.
