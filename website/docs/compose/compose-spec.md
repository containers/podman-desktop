---
title: Compose specification with Podman Desktop
sidebar_position: 1
---

Podman Desktop supports the [Compose specification](https://compose-spec.io).

With Podman Desktop, you can create and manage multi-container applications defined in Compose files.

### Procedure

1. You have a Compose file.
1. You run a Compose engine on the Compose file:

   - [Compose](https://github.com/docker/compose): The Go reference implementation.
   - [Podman Compose](https://github.com/containers/podman-compose): Alternative Python implementation with native Podman integration.

1. The Compose engine starts the containers and services, and adds an internal label to each resource:

   - Container label: `com.docker.compose.project`
   - Service label: `com.docker.compose.service`

1. Podman Desktop detects the Compose labels, and lists it appropriately within the UI.

   ![img2](img/compose_doc_image_2.png)
