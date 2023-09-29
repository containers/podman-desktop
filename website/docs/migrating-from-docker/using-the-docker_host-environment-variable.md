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

- Continue using familiar Docker commands.
- Take advantage of the benefits of Podman.
- Your tools, such as [Gradle](https://gradle.org/) or [Testcontainers](https://www.testcontainers.org/), communicate with Podman without reconfiguration.

#### Prerequisites

- Podman

#### Procedure

 <Tabs groupId="operating-systems">
   <TabItem value="win" label="Windows">

1. Identify the location of your Podman pipe

```shell-session
$ podman machine inspect --format '{{.ConnectionInfo.PodmanPipe.Path}}'
```

2. Set the `DOCKER_HOST` environment variable to your Podman pipe location. You'll need to replace back slashes with forward slashes and add the `npipe://` scheme to the path retrieved previously:

```shell-session
$ export DOCKER_HOST=npipe://<your_podman_pipe_location>
```

Note that setting the `DOCKER_HOST` environment variable isn't neccesary on windows since Podman also listens to the default `docker_engine` pipe.
</TabItem>
<TabItem value="mac" label="macOS">

1. Identify the location of your Podman socket

```shell-session
$ podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}'
```

2. Set the `DOCKER_HOST` environment variable to your Podman socket location. Be sure to add the `unix://` scheme to the path retrieved previously:

```shell-session
$ export DOCKER_HOST=unix://<your_podman_socket_location>
```

   </TabItem>
   <TabItem value="linux" label="Linux">

1. Identify the location of your Podman socket

```shell-session
$ podman info --format '{{.Host.RemoteSocket.Path}}'
```

2. Set the `DOCKER_HOST` environment variable to your Podman socket location. Be sure to add the `unix://` scheme to the path retrieved previously:

```shell-session
$ export DOCKER_HOST=unix://<your_podman_socket_location>
```

   </TabItem>

 </Tabs>

#### Verification

- Your tools using the `DOCKER_HOST` environment variable, such as [Gradle](https://gradle.org/) or [Testcontainers](https://www.testcontainers.org/), communicate with Podman without reconfiguration.
