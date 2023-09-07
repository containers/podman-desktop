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

1. Install the Compose engine: in the Podman Desktop status bar, click **<icon icon="fa-solid fa-download" size="lg" />Compose**, and follow the prompts.
1. To use the Compose engine from your terminal, [set the DOCKER_HOST variable](/docs/migrating-from-docker/using-the-docker_host-environment-variable).

#### Verification

1. Open a terminal.
1. The Compose reference implementation is in your PATH, therefore, you can display the Compose engine version:

   ```shell-session
   $ docker-compose version
   ```

1. The DOCKER_HOST variable is set:

   ```shell-session
   $ env | grep DOCKER_HOST
   ```

#### Additional resources

- (Alternatively) [Installing Podman Compose](https://github.com/containers/podman-compose#installation): alternative Python implementation with Podman integration.
- [Compose engine repository](https://github.com/docker/compose).
