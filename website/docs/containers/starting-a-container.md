---
sidebar_position: 30
title: Containers
description: Starting a container on your container engine.
keywords: [podman desktop, podman, containers, images]
tags: [images]
---

# Starting a container on your container engine

With Podman Desktop, you can start a container from an image on your container engine.
You can interact with the running container by using the terminal in Podman Desktop, or by opening your browser to the exposed ports.

#### Prerequisites

- The **<Icon icon="fa-solid fa-cloud" size="lg" /> Images** list has your image, such as `quay.io/podman/hello`.

#### Procedure

1. Go to **<Icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. On the line with your image name, such as `quay.io/podman/hello`, click **<Icon icon="fa-solid fa-play" size="lg" />**.
1. On the **Create a container** screen, review the configuration.
1. Click **<Icon icon="fa-solid fa-play" size="lg" /> Start Container**.

#### Verification

1. Go to **<Icon icon="fa-solid fa-cubes" size="lg" /> Containers**.
1. **<Icon icon="fa-solid fa-search" size="lg" />**: Enter your image name, such as `quay.io/podman/hello`, to find your running container.
1. Click your running container name.
1. To view logs:
   1. Go to **Logs**.
   1. Browse the content.
1. To inspect the container:
   1. Go to **Inspect**.
   1. Click the content area to activate it.
   1. Enter <kbd>Ctrl</kbd> + <kbd>F</kbd> on Windows and Linux, or <kbd>⌘</kbd> + <kbd>F</kbd> on macOS to start searching in the content.
1. To generate Kubernetes YAML, when your container engine is Podman:
   1. Go to **Kube**.
   1. Click the content area to activate it.
   1. Enter <kbd>Ctrl</kbd> + <kbd>F</kbd> on Windows and Linux, or <kbd>⌘</kbd> + <kbd>F</kbd> on macOS to start searching in the content.
   1. Copy the content to a YAML file.
   1. Later, you can reuse this file to start a container in Podman from Kubernetes YAML, or to start a pod in Kubernetes.
1. To interact with the container terminal:
   1. Go to **Terminal**.
   1. Click the content area to activate the terminal.
   1. Enter your commands.
1. To interact with the exposed ports:
   1. Click **<Icon icon="fa-solid fa-external-link" size="lg" />**.
   1. Your browser opens a page to the first exposed port on `localhost`.
1. To deploy to your current Kubernetes context, when you container engine is Podman:
   1. Click **<Icon icon="fa-solid fa-rocket" size="lg" />**.
   1. Review the **Deploy generated pod to Kubernetes** screen.
   1. Click **<Icon icon="fa-solid fa-rocket" size="lg" />**.
1. To stop the container:
1. Click **<Icon icon="fa-solid fa-stop" size="lg" />**.
1. To delete the container:
1. Click **<Icon icon="fa-solid fa-trash" size="lg" />**.
