---
sidebar_position: 2
title: Using the `DOCKER_HOST` environment variable
description: Using the `DOCKER_HOST` environment variable can make it easier to migrate from Docker to Podman Desktop, as it allows you to continue using familiar Docker commands while taking advantage of the benefits of Podman.
keywords: [podman desktop, podman, containers, docker_host, environment, variable]
tags: [migrating-from-docker]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Using the `DOCKER_HOST` environment variable

Consider using the `DOCKER_HOST` environment variable to migrate transparently from Docker to Podman Desktop on all platforms.

* Continue using familiar Docker commands.
* Take advantage of the benefits of Podman.
* Your tools, such as [Gradle](https://gradle.org/) or [Testcontainers](https://www.testcontainers.org/), communicate with Podman without reconfiguration.

#### Prerequisites

* Podman

#### Procedure

1. Identify the location of your Podman socket

    <Tabs groupId="operating-systems">
      <TabItem value="win" label="Windows">

      ```shell-session
      $ podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}'
      ```

      </TabItem>
      <TabItem value="mac" label="macOS">

      ```shell-session
      $ podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}'
      ```

      </TabItem>
      <TabItem value="linux" label="Linux">

      ```shell-session
      $ podman info --format '{{.Host.RemoteSocket.Path}}'
      ```

      </TabItem>
    </Tabs>

2. Set the `DOCKER_HOST` environment variable to your Podman socket location:

    ```shell-session
    $ export DOCKER_HOST=<your_podman_socket_location>
    ```

#### Verification

* Your tools using the `DOCKER_HOST` environment variable, such as [Gradle](https://gradle.org/) or [Testcontainers](https://www.testcontainers.org/), communicate with Podman without reconfiguration.
