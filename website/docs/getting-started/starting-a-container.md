---
sidebar_position: 5
title: Starting a container
description: Starting a container on your container engine.
keywords: [podman desktop, podman, containers, images]
tags: [images]
---

# Starting a container on your Container engine

With Podman Desktop, you can start a container from an image on your container engine.
You can interact with the running container by using the terminal in Podman Desktop, or by opening your browser to the exposed ports.

#### Prerequisites

- The **<icon icon="fa-solid fa-cloud" size="lg" /> Images** list has your image, such as `docker.io/library/redis`, `docker.io/library/nginx`.

#### Procedure

1. Go to **<icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. On the line with your image name, click **<icon icon="fa-solid fa-play" size="lg" />**.
1. On the **Create a container** screen, review the configuration.
   1. **Container name**: enter a name, such as `my_container`.
1. Click **<icon icon="fa-solid fa-play" size="lg" /> Start Container**.

#### Verification

1. Go to **<icon icon="fa-solid fa-cubes" size="lg" /> Containers**.
1. Click your container name, such as `my_container`.
1. To search logs:
   1. Go to **Logs**.
   1. Click the content area to activate it.
   1. Enter `Ctrl +F` to start searching in the content.
1. To inspect the container:
   1. Go to **Inspect**.
   1. Click the content area to activate it.
   1. Enter `Ctrl +F` to start searching in the content.
1. To generate Kubernetes YAML:
   1. Go to **Kube**.
   1. Click the content area to activate it.
   1. Enter `Ctrl +F` to start searching in the content.
   1. Copy the content to a YAML file.
1. To interact with the container terminal:
   1. Go to **Terminal**.
   1. Click the content area to activate the terminal.
   1. Enter your commands.
1. To interact with the exposed ports:
   1. Click **<icon icon="fa-solid fa-external-link" size="lg" />**.
   1. Your browser opens a page to the exposed port on `localhost`.
1. To deploy to your current Kubernetes context:
   1. Click **<icon icon="fa-solid fa-rocket" size="lg" />**.
   1. Review the **Deploy generated pod to Kubernetes** screen.
   1. Click **<icon icon="fa-solid fa-rocket" size="lg" />**.
1. To stop the container:
   1. Click **<icon icon="fa-solid fa-stop" size="lg" />**.
1. To delete the container:
   1. Click **<icon icon="fa-solid fa-trash" size="lg" />**.
