---
title: Running Compose files
description: With Podman Desktop, you can manage multi-container applications defined in Compose files.
sidebar_position: 3
keywords: [compose]
tags: [compose]
---

With Podman Desktop, you can manage multi-container applications defined in a Compose file.

#### Prerequisites

- [You have set up a Compose engine](setting-up-compose).
- You have a [Compose file](https://github.com/compose-spec/compose-spec/blob/master/spec.md#compose-file), such as `compose.yaml`.

#### Procedure

- Run the command in a terminal:

  ```shell-session
  $ docker-compose --file compose.yaml up --detach
  ```

#### Verification

- The Podman Desktop **<icon icon="fa-solid fa-cube" size="lg" /> Containers** list displays the containers created by Compose grouped in a container group with a `(compose)` suffix, such as `flask-redis (compose)`.

  ![img2](img/compose-in-containers-view.png)

#### Additional resources

- [Compose file specification](https://github.com/compose-spec/compose-spec/blob/master/spec.md#compose-file)
