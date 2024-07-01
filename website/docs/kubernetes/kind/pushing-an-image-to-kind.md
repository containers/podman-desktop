---
sidebar_position: 10
title: Push an image to Kind
description: Pushing an image to your Kind cluster
keywords: [podman desktop, podman, containers, images, migrating, kubernetes]
tags: [migrating-to-kubernetes, images]
---

# Pushing an image to your local Kind-powered Kubernetes cluster

With Podman Desktop, you can push an image to your local Kind-powered Kubernetes cluster.

#### Prerequisites

- [You onboarded a container engine](/docs/containers).
- [You onboarded a Kind cluster](/docs/kind).
- [You have set your Kubernetes context to your local Kind-powered Kubernetes cluster](/docs/kind/working-with-your-local-kind-cluster).
- Your image is available on the **Images** page: `<my_image>:<my_tag>`.

#### Procedure

1. Open **Podman Desktop dashboard > <Icon icon="fa-solid fa-cloud" size="lg" /> Images**.
1. **<Icon icon="fa-solid fa-search" size="lg" /> Search images**: `<your_image>:<your_tag>`.
1. Click **<Icon icon="fa-solid fa-ellipsis-v" size="lg" /> > <Icon icon="fa-solid fa-ellipsis-v" size="lg" /> Push image to Kind cluster**.
1. If you created many Kind clusters, select your Kind cluster from the list.

#### Verification

With recent versions of Kind, the `crictl` command can be used - e.g., `podman exec -it kind-cluster-control-plane crictl images`. The name of the control plane container may vary, so you can use a filter to query for the container:

```shell
podman exec -it $(podman ps --filter "label=io.x-k8s.kind.role=control-plane" --format {{.Names}}) crictl images
```

See the [Kind Quickstart](https://kind.sigs.k8s.io/docs/user/quick-start/#loading-an-image-into-your-cluster) for details.
