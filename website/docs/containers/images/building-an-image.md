---
sidebar_position: 20
title: Building an image
description: Building an image on your container engine.
keywords: [podman desktop, podman, containers, images]
tags: [images]
---

# Building an image on your container engine

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
