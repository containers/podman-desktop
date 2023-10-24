---
sidebar_position: 10
title: Push an image to Lima
description: Pushing an image to your Lima cluster
keywords: [podman desktop, podman, containers, images, migrating, kubernetes]
tags: [migrating-to-kubernetes, images]
---

# Pushing an image to your local Lima-powered Kubernetes cluster

With Podman Desktop, you can push an image to your local Lima-powered Kubernetes cluster.

#### Prerequisites

- [You onboarded a container engine](/docs/containers).
- [You onboarded a Lima cluster](/docs/lima).
- [You have set your Kubernetes context to your local Lima-powered Kubernetes cluster](/docs/kubernetes/existing-kubernetes).
- Your image is available on the **Images** page: `<my_image>:<my_tag>`.

#### Procedure

1. Open **Podman Desktop dashboard > <icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. **<icon icon="fa-solid fa-search" size="lg" /> Search images**: `<your_image>:<your_tag>`.
1. Click **<icon icon="fa-solid fa-ellipsis-v" size="lg" /> > <icon icon="fa-solid fa-ellipsis-v" size="lg" /> Push image to Lima cluster**.

#### Verification

Lima enables you to list loaded images, using:

```shell-session
$ LIMA_INSTANCE=<name> lima sudo crictl images
```

You can also create a Pod that uses the loaded image:

1. Create a `verify_my_image.yaml` Kubernetes YAML file on your workstation.
   Replace the placeholders:

   - Pod `name` and container `name` value must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character.
   - Container `image` value is the image you pushed.

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: <verify-my-image>
   spec:
     containers:
       - name: <my-image>
         image: <my_image>:<my_tag>
         imagePullPolicy: Never
   ```

1. Open **<icon icon="fa-solid fa-cubes" size="lg" /> Pods > Play Kubernetes YAML**.
   1. **Kubernetes YAML file**: select your `verify_my_image.yaml` file.
   1. **Select Runtime**: **Using a Kubernetes cluster**.
   1. Click **Play**.
   1. Click **Done**
1. Open **<icon icon="fa-solid fa-cubes" size="lg" /> Pods**.
1. **<icon icon="fa-solid fa-search" size="lg" /> Search pods**: `<verify-my-image>`.
1. The pod **Status** is **Running**.
