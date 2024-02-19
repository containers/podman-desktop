---
sidebar_position: 4
title: Creating a cluster
description: Creating a local Minikube-powered Kubernetes cluster.
keywords: [podman desktop, podman, containers, migrating, kubernetes, minikube]
tags: [migrating-to-kubernetes, minikube]
---

# Creating a local Minikube-powered Kubernetes cluster

You can create multiple local Minikube-powered Kubernetes clusters.

#### Prerequisites

- [You installed Minikube](/docs/minikube/installing).
- [On Windows, you configured Podman](/docs/minikube/configuring-podman-for-minikube-on-windows).

#### Procedure

1. Go to **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources**
1. In the Minikube tile, click on the **Create new ...** button.
1. Choose your options, and click the **Create** button.

   The defaults are:

   - Name: `minikube`
   - Driver: `podman`
   - Container runtime: `cri-o`

1. (Optionally) Click the **Show logs** button to display the logs.
1. After successful creation, click on the **Go back to resources** button

#### Verification

1. In **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources**, in the **Minikube** tile, your `<minikube>` instance is running.
1. In the Podman Desktop tray, open the **Kubernetes** menu, you can set the context to your Minikube cluster: `minikube`.
