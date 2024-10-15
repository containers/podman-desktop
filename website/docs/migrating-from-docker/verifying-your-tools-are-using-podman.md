---
sidebar_position: 6
title: Verifying your tools are using Podman
description: Verify that your tools are using Podman rather than Docker.
keywords: [podman desktop, podman, containers, migrating, docker]
tags: [migrating-from-docker]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Verifying that your tools are using Podman

When you have configured your host to use Podman rather then Docker, consider verifying your setup works as intended.

#### Prerequisites

- Docker service is stopped, or not installed.
- [Saved containers are imported to Podman](/docs/migrating-from-docker/importing-saved-containers)
- [The `DOCKER_HOST` environment variable is set](/docs/migrating-from-docker/using-the-docker_host-environment-variable)
- [On macOS, the `podman-mac-helper` service is running](/docs/migrating-from-docker/using-podman-mac-helper)
- [Podman is emulating Docker CLI](/docs/migrating-from-docker/emulating-docker-cli-with-podman)

#### Procedure

1. The Docker socket replies successfully for listing all containers:

   <Tabs groupId="operating-systems">
     <TabItem value="win" label="Windows">

   ```shell-session
   $ curl --unix-socket npipe:////./pipe/docker_engine "http:/v1.41/containers/json?all=true"
   ```

     </TabItem>
     <TabItem value="mac" label="macOS">

   ```shell-session
   $ curl --unix-socket /var/run/docker.sock "http:/v1.41/containers/json?all=true"
   ```

     </TabItem>
     <TabItem value="linux" label="Linux">

   ```shell-session
   $ curl --unix-socket /var/run/docker.sock "http:/v1.41/containers/json?all=true"
   ```

     </TabItem>
   </Tabs>

2. Podman commands run successfully when redirected to the Docker socket:

   <Tabs groupId="operating-systems">
     <TabItem value="win" label="Windows">

   ```shell-session
   $ CONTAINER_HOST=npipe:////./pipe/docker_engine podman ps
   ```

     </TabItem>
     <TabItem value="mac" label="macOS">

   ```shell-session
   $ CONTAINER_HOST=unix:///var/run/docker.sock podman ps
   ```

     </TabItem>
     <TabItem value="linux" label="Linux">

   ```shell-session
   $ CONTAINER_HOST=unix:///var/run/docker.sock podman ps
   ```

     </TabItem>
   </Tabs>
