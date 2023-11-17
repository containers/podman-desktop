---
sidebar_position: 21
title: Pushing an image to a registry
description: Pushing an image to a registry.
keywords: [podman desktop, podman, containers, image, registry, registries]
tags: [images]
---

# Pushing an image to a registry

With Podman Desktop, you can push an image to registries.

#### Prerequisites

- You have configured your registry **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Registries**.
- You have built an image, which name is the fully qualified name required for your registry, such as `quay.io/my-repository/my-image`, `ghcr.io/my-repository/my-image`, or `docker.io/my-repository/my-image`.
  Ensure that the image name includes the registry where to publish the image. To publish on `quay.io/repository` the image `my-image`, the FQN image name should be `quay.io/repository/my-image`.

#### Procedure

1. Go to **<Icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. On your image line, click **<Icon icon="fa-solid fa-ellipsis-v" size="lg" /> > <Icon icon="fa-solid fa-arrow-up" size="lg" />Push Image**.
1. Select the Image tag for your registry.
1. Click **<Icon icon="fa-solid fa-arrow-up" size="lg" />Push Image**.
1. Click **Done**.

#### Verification

1. Go to your container registry.
1. Find your image.
