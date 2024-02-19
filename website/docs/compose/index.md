---
sidebar_position: 35
title: Compose
description: With Podman Desktop, you can install a Compose engine and manage multi-container applications defined in Compose files.
keywords: [compose]
tags: [compose]
---

# Working with Compose

Podman Desktop supports the [Compose specification](https://compose-spec.io), and can set up Compose, and manage multi-container applications defined in Compose files.

Podman Desktop displays the multi-container applications that Compose creates as a container group.

![Podman Desktop detects the multi-container applications that Compose creates as a container group.](img/compose-in-containers-view.png)

## Setting up Compose

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

#### Additional resources

- (Alternatively) Use an alternative Compose implementation in Python with Podman integration: [install Podman Compose](https://github.com/containers/podman-compose#installation).
- (Alternatively) [Download and install Compose yourself](https://github.com/docker/compose/releases).

## Running a Compose file

With Podman Desktop, you can manage multi-container applications defined in a Compose file.

#### Prerequisites

- [Podman](/docs/onboarding-for-containers/installing-podman) 4.7.0 or greater.
- [You have set up Compose](/docs/compose/setting-up-compose).
- [You have a Compose file](https://github.com/compose-spec/compose-spec/blob/master/spec.md#compose-file), such as `compose.yaml`.

#### Procedure

- Run the command in a terminal:

  ```shell-session
  $ podman compose --file compose.yaml up --detach
  ```

  <details>
  <summary>

  (Alternatively) With an older Podman version, run `docker-compose`:

  </summary>

  1. [Set the DOCKER_HOST variable](/docs/migrating-from-docker/using-the-docker_host-environment-variable).
  1. Run `docker-compose` rather than `podman compose`:

     ```shell-session
     $ docker-compose --file compose.yaml up --detach
     ```

  </details>

  <details>
  <summary>

  (Optionally) Learn about Compose commands:

  </summary>

  ```shell-session
  $ podman compose --help
  ```

  </details>

#### Verification

1. The Compose engine starts the containers and services, and adds a label to each resource:

   - Container label: `com.docker.compose.project`
   - Service label: `com.docker.compose.service`

1. Podman Desktop detects the Compose labels, and displays the container group as a group of containers.

   The Podman Desktop **<Icon icon="fa-solid fa-cube" size="lg" /> Containers** list displays the containers created by Compose grouped in a container group with a `(compose)` suffix, such as `flask-redis (compose)`.

![img2](img/compose-in-containers-view.png)
