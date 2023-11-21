---
title: Setting up Compose
description: Podman Desktop can install the Compose engine.
sidebar_position: 2
keywords: [compose]
tags: [compose]
---

# Setting up Compose

Podman Desktop can install the Compose engine.

#### Procedure

1. Go to **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources**.
1. In the **Compose** tile, click **Setup**, and follow the prompts.

#### Verification

1. The Compose reference implementation is in your `PATH`, therefore, you can display the Compose engine version in a terminal:

   ```shell-session
   $ docker-compose version
   ```

1. Podman detects the same Compose version:

   ```shell-session
   $ podman compose version
   ```

#### Next steps

- [Run Compose](/docs/compose/running-compose).

#### Additional resources

- (Alternatively) Use an alternative Compose implementation in Python with Podman integration: [install Podman Compose](https://github.com/containers/podman-compose#installation).
- (Alternatively) [Download and install Compose yourself](https://github.com/docker/compose/releases).
