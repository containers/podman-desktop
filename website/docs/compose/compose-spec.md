---
title: Compose Spec with Podman Desktop
sidebar_position: 1
---

## Introduction

Podman Desktop supports the [Compose spec](https://compose-spec.io). With Podman Desktop, users can easily create and manage multi-container applications using Compose files.

### How does it work?

Each time you deploy a Compose file through [Podman Compose](https://github.com/containers/podman-compose) or [Docker Compose](https://docs.docker.com/compose/) a label is assigned to each container. 
Podman Desktop detects that label and shows it appropriately within the GUI.

![img2](img/compose_doc_image_2.png)

### What do I need to enable?

Containers deployed by the Compose specification are automatically detected by Podman Desktop.

### What if I already have Docker Compose / Podman Compose installed?

Any containers already deployed by Docker Compose / Podman Compose will be automatically shown within Podman Desktop. You don't need to do anything!