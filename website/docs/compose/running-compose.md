---
title: Running Compose files
description: With Podman Desktop, you can manage multi-container applications defined in Compose files.
sidebar_position: 3
keywords: [compose]
tags: [compose]
---

With Podman Desktop, you can manage multi-container applications defined in a Compose file.

#### Prerequisites

- [You have set up a container engine](/docs/onboarding/containers).
- [You have set up Compose](/docs/compose/setting-up-compose).
- [You have a Compose file](https://github.com/compose-spec/compose-spec/blob/master/spec.md#compose-file), such as `compose.yaml`.

#### Procedure

- Run the command in a terminal:

  ```shell-session
  $ podman compose --file compose.yaml up --detach
  ```

#### Verification

1. The Compose engine starts the containers and services, and adds a label to each resource:

   - Container label: `com.docker.compose.project`
   - Service label: `com.docker.compose.service`

1. Podman Desktop detects the Compose labels, and displays the container group as a group of containers.

   The Podman Desktop **<icon icon="fa-solid fa-cube" size="lg" /> Containers** list displays the containers created by Compose grouped in a container group with a `(compose)` suffix, such as `flask-redis (compose)`.

![img2](img/compose-in-containers-view.png)

#### Additional resources

- [Compose file specification](https://github.com/compose-spec/compose-spec/blob/master/spec.md#compose-file).
- Learn about Compose commands:

  ```shell-command
  $ podman compose --help
  ```

- (Alternatively) To use `docker-compose` from your terminal rather than `podman compose`: [set the DOCKER_HOST variable](/docs/migrating-from-docker/using-the-docker_host-environment-variable).
