---
sidebar_position: 10
title: Building and testing an image
description: Building an image and testing it in Kubernetes
keywords: [podman desktop, podman, containers, pods, migrating, kubernetes]
tags: [migrating-to-kubernetes]
---

# Building an image and testing it in Kubernetes

With Podman Desktop, you can build an image with your container engine, and test it in Kubernetes.

#### Prerequisites

- Podman Desktop has access to:
  - A running container engine.
  - A running Kubernetes cluster.
- A container definition file: `Containerfile` or `Dockerfile`.

#### Procedure

1. Build your image:

   1. Open **<icon icon="fa-solid fa-cloud" size="lg" /> Images > <icon icon="fa-solid fa-cube" size="lg" /> Build an image**.
   2. **Containerfile path**: select your `Containerfile` or `Dockerfile`.
   3. **Build context directory**: optionally, select a directory different from the directory containing your `Containerfile` or `Dockerfile`.
   4. **Image Name**: enter your image name `my-custom-image`.
   5. Click **<icon icon="fa-solid fa-cube" size="lg" /> Build**.
   6. Wait for the image build to finish.
   7. Click **Done** to get back to the images list.

1. Push your image to your Kubernetes cluster:

   1. **<icon icon="fa-solid fa-cloud" size="lg" /> Search images**: enter your image name `my-custom-image` to find the image.
   2. Click **<icon icon="fa-solid fa-ellipsis-v" size="lg" /> > <icon icon="fa-solid fa-ellipsis-v" size="lg" /> Push image to Kind cluster**.

1. Test your image by creating a container:

   1. Click **<icon icon="fa-solid fa-play" size="lg" />** to open the **Create a container from image** dialog.
   2. **Container name**: enter `my-custom-image-container`.
   3. Review the parameters that Podman Desktop has detected from your image definition.
   4. Click **<icon icon="fa-solid fa-play" size="lg" /> Start Container** to start the container in your container engine.

1. Test your image and container on Kubernetes:

   1. **<icon icon="fa-solid fa-cloud" size="lg" /> Search containers**: enter `my-custom-image-container` to find the running container.
   2. Click **<icon icon="fa-solid fa-ellipsis-v" size="lg" /> > <icon icon="fa-solid fa-rocket" size="lg" /> Deploy to Kubernetes** to open the **Deploy generated pod to Kubernetes** screen.
   3. **Pod Name**: keep the proposed value `my-custom-image-container-pod`.
   4. **Use Kubernetes Services**: select **Replace `hostPort` exposure on containers by Services. It is the recommended way to expose ports, as a cluster policy might prevent to use `hostPort`.**
   5. **Expose service locally using Kubernetes Ingress**: select **Create a Kubernetes ingress to get access to the ports that this pod exposes, at the default ingress controller location. Example: on a default Kind cluster created with Podman Desktop: `http://localhost:9090`. Requirements: your cluster has an ingress controller`**.
   6. **Kubernetes namespaces**: select `default`.
   7. Click **<icon icon="fa-solid fa-rocket" size="lg" /> Deploy**.
   8. Wait for the pod to reach the state: **Phase: Running**.
   9. Click **Done**.

#### Verification

1. The **<icon icon="fa-solid fa-cubes" size="lg" /> Pods** screen lists the running `my-image-container-pod` pod.
1. Click on the pod name to view details and logs.
1. Optionally, if your container is exposing a port, go to `http://localhost:9090`: your application is running.
