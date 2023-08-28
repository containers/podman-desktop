---
title: Compose spec with Podman Desktop
sidebar_position: 1
---

## Introduction

Podman Desktop supports the [Compose specification](https://compose-spec.io). With Podman Desktop, users can easily create and manage multi-container applications by using Compose files.

We support two version of the Compose specification:

- [Podman Compose](https://github.com/containers/podman-compose): The Python implementation of the Compose specification with native Podman integration.
- [Compose](https://github.com/docker/compose): The Go reference implementation of the Compose specification.

### How does it work

Each time you run a Compose file by using either [Podman Compose](https://github.com/containers/podman-compose) or [Compose](https://github.com/docker/compose) an internal label is assigned to each container (`com.docker.compose.project`) or service (`com.docker.compose.service`).

Podman Desktop detects this label and lists it appropriately within the UI.

![img2](img/compose_doc_image_2.png)

### What do you need to enable

Containers deployed by a correctly implemented Compose specification are automatically detected by Podman Desktop using the assigned above labels.

### What if you already have Docker Compose or Podman Compose installed

Any containers already deployed by Docker Compose / Podman Compose will be automatically shown within Podman Desktop. You do not need to do anything!
