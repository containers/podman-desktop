---
sidebar_position: 10
title: Authenticating to a registry
description: Authenticating to a pre-configured registry.
keywords: [podman desktop, podman, containers, registry, registries]
tags: [images]
---

# Authenticating to a pre-configured registry

With Podman Desktop, you can authenticate to a set of pre-configured registries:

- Red Hat Quay
- Docker Hub
- GitHub
- Google Container registry

#### Prerequisites

- You have credentials on a pre-configured image registry.

#### Procedure

1. Go to **<icon icon="fa-solid fa-cog" size="lg" /> Settings > Registries**.
1. On your registry line, click **Configure**.

   1. **User name**: Enter your user name.
   1. **Password**: Enter your password or OAuth secret.

#### Verification

1. Go to **<icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. You can pull a private image from the registry.
1. You can push an image to the registry:
   1. Build an image the fully qualified name required for your registry, such as `quay.io/my_repository/my_image`.
   1. On your `quay.io/my_repository/my_image` image line, click **<icon icon="fa-solid fa-ellipsis-v" size="lg" />**.
   1. The contextual menu has a **<icon icon="fa-solid fa-arrow-up" size="lg" />Push Image** entry.
