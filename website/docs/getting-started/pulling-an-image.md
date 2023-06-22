---
sidebar_position: 2
title: Pulling an image
description: Pulling an image to your container engine.
keywords: [podman desktop, podman, containers, images]
tags: [images]
---

# Pulling an image to your container engine

With Podman Desktop, you can pull an image from a registry, to your container engine.

#### Prerequisites

- The image is available in a registry.
- If the registry or the image are not publicly available, you configured access to the registry on Podman Desktop in **<icon icon="fa-solid fa-cog" size="lg" /> Settings > registry**.

#### Procedure

1. Go to **<icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. Click **<icon icon="fa-solid fa-arrow-circle-down" size="lg" /> Pull an image**.
1. On the **Image to Pull** screen:
   1. **Image to pull**: enter the image name, such as `quay.io/podman/hello`. Prefer the fully qualified image name that specifies the registry, to the short name that might lead to registry resolution mistakes.
   2. Click **Pull image**.
1. Click **Done**.

#### Verification

1. Go to **<icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. Click the image name you pulled, such as `quay.io/podman/hello`. Podman Desktop always displays the fully qualified image name.
1. Go to **Summary**.
1. Go to **History**.
   1. Click the output area.
   2. Enter `Ctrl + F` to search the content.
1. Go to **Inspect**.
   1. Click the output area.
   2. Enter `Ctrl + F` to search the content.
