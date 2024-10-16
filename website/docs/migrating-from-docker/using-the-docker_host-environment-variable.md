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
- Your tools, such as [Gradle](https://gradle.org/) or [Testcontainers](https://www.testcontainers.com/), communicate with Podman without reconfiguration.

Using the `DOCKER_HOST` environment variable, you can connect your Docker CLI to the Podman socket.

:::note

Alternatively, you can add a `podman` context by using the `docker context create` command. 
- For example, set the value of the context in this pattern on a macOS machine:

    `docker context create podman --docker "host=unix://$HOME.local/share/containers/podman/machine/podman.sock"` 
    
    Where, the path specified after the `unix://` scheme denotes the `DOCKER_HOST` value.

Then, you can run the `docker context use podman` command to switch to that context. This way you can use your Docker CLI to run your tasks on a remote Podman engine. When you run the `docker ps` command, it queries the Podman socket specified in the current context.

:::

#### Prerequisites

- Podman

#### Procedure

 <Tabs groupId="operating-systems">
   <TabItem value="win" label="Windows">

1. Identify the location of your Podman pipe <!-- markdownlint-disable MD029 -->

```shell-session
$ podman machine inspect --format '{{.ConnectionInfo.PodmanPipe.Path}}'
```

2. Set the `DOCKER_HOST` environment variable to your Podman pipe location. You'll need to replace back slashes with forward slashes and add the `npipe://` scheme to the path retrieved previously: <!-- markdownlint-disable MD029 -->

    > Example:
    >
    > **prefix**podman-pipe
    >
    > **npipe://**//./pipe/podman-machine-default

    Depending on your terminal emulator of preference, there is a little variation between the commands to set a session level environment variable:

    ##### cmd - Command Prompt

    ```cmd
    set DOCKER_HOST=npipe://<inspect_command_output>
    ```

    ##### Git Bash

    ```bash
    export DOCKER_HOST=npipe://<inspect_command_output>
    ```

    ##### Powershell

    Don't miss the quotes used with the value. Otherwise, powershell will interpret it as a separate command instead of a value.

    ```powershell
    $env:DOCKER_HOST="npipe://<inspect_command_output>"
    ```

    Ideally, you should set `DOCKER_HOST` at the system or user level environment variables (or even load it in your CL emulator init script of choice).

:::note

Setting the `DOCKER_HOST` environment variable isn't necessary on Windows because Podman also listens to the default `docker_engine` pipe. But, it might be necessary if you get the following error: **Error: socket of machine is not set**, while trying to use the `podman compose` command.

::: 

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

- Your tools using the `DOCKER_HOST` environment variable, such as [Gradle](https://gradle.org/) or [Testcontainers](https://www.testcontainers.com/), communicate with Podman without reconfiguration.
