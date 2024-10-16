---
sidebar_position: 25
title: Migrating from Docker
description: Migrate transparently from Docker to Podman, and continue using familiar workflows.
keywords: [podman desktop, podman, containers, migrating, docker]
tags: [migrating-from-docker]
---

# Migration from Docker to Podman Desktop

If you have used Docker in the past, you can continue using familiar workflows with the Docker compatibility feature of Podman Desktop.

Docker compatibility is a way to configure an environment in which you can run your Docker applications, commands, and tools on a Podman engine without reconfiguration. It encompasses two stages:
- [Import your saved containers](/docs/migrating-from-docker/importing-saved-containers) into Podman Desktop using CLI. 
- [Access the Docker Compatibility settings](/docs/migrating-from-docker/managing-docker-compatibility) to configure a Docker-compatible environment based on your needs. 
    - On macOS: The **Third-Party Docker Tool Compatibility** setting is enabled by default. You can use all Docker tools, including CLI, with the Podman engine.

        :::note

        On Windows and Linux, the **Third-Party Docker Tool Compatibility** setting is not available. You can [use the `DOCKER_HOST` environment variable](/docs/migrating-from-docker/using-the-docker_host-environment-variable) to let your tools communicate directly with the Podman socket.

        :::


