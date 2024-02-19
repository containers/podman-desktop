---
sidebar_position: 4
title: Images
description: Working with container images
tags: [podman-desktop, containers, images]
keywords: [podman desktop, podman, containers, images]
hide_table_of_contents: false
---

# Working with container images

With Podman Desktop, you can work with OCI images for your container engine workloads.

## Building an image on your container engine

With Podman Desktop, you can build an image from a Containerfile on your container engine.

#### Prerequisites

- Your Containerfile: `Containerfile` or `Dockerfile`.

#### Procedure

1. Go to **<Icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. Click **<Icon icon="fa-solid fa-cube" size="lg" /> Build an image**.
1. On the **Build Image from Containerfile** screen
   1. **Containerfile path**: select the `Containerfile` or `Dockerfile` to build.
   1. **Image Name**: enter your image name, such as `my-image`. If you want to push the image to a registry, use the fully qualified image name that your registry requires, such as `quay.io/my-repository/my-image`, `ghcr.io/my-repository/my-image`, or `docker.io/my-repository/my-image`.
   1. Click **<Icon icon="fa-solid fa-cubes" size="lg" /> Build**.
   1. Click **Done**.

#### Verification

1. Go to **<Icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. **<Icon icon="fa-solid fa-search" size="lg" />**: Enter your image name, such as `quay.io/my-repository/my-image`, `ghcr.io/my-repository/my-image`, or `docker.io/my-repository/my-image`.
1. Click the line with your image name.
1. Go to **History**.
   1. Click the content area to activate it.
   1. Enter <kbd>Ctrl</kbd> + <kbd>F</kbd> on Windows and Linux, or <kbd>⌘</kbd> + <kbd>F</kbd> on macOS to start searching in the content.
1. Go to **Inspect**.
   1. Click the content area to activate it.
   1. Enter <kbd>Ctrl</kbd> + <kbd>F</kbd> on Windows and Linux, or <kbd>⌘</kbd> + <kbd>F</kbd> on macOS to start searching in the content.
1. Click **<Icon icon="fa-solid fa-play" size="lg" />**..
   1. You see the **Create a container** screen.

## Pushing an image to a registry

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

## Pulling an image to your container engine

With Podman Desktop, you can pull an image from a registry, to your container engine.

#### Prerequisites

- The image is available in a registry.
- If the registry or the image are not publicly available, you configured access to the registry on Podman Desktop in **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Registries**.

#### Procedure

1. Go to **<Icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. Click **<Icon icon="fa-solid fa-arrow-circle-down" size="lg" /> Pull an image**.
1. On the **Image to Pull** screen:
   1. **Image to pull**: enter the image name, such as `quay.io/podman/hello`. Prefer the fully qualified image name that specifies the registry, to the short name that might lead to registry resolution mistakes.
   2. Click **Pull image**.
1. Click **Done**.

#### Verification

1. Go to **<Icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. Click the image name you pulled, such as `quay.io/podman/hello`. Podman Desktop always displays the fully qualified image name.
1. Go to **Summary**.
1. Go to **History**.
   1. Click the output area.
   1. Enter <kbd>Ctrl</kbd> + <kbd>F</kbd> on Windows and Linux, or <kbd>⌘</kbd> + <kbd>F</kbd> on macOS to start searching in the content.
1. Go to **Inspect**.
   1. Click the output area.
   1. Enter <kbd>Ctrl</kbd> + <kbd>F</kbd> on Windows and Linux, or <kbd>⌘</kbd> + <kbd>F</kbd> on macOS to start searching in the content.
