---
sidebar_position: 4
title: Creating a cluster
description: Creating a local Kind-powered Kubernetes cluster.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Creating a local Kind-powered Kubernetes cluster

You can create multiple local Kind-powered Kubernetes clusters.

#### Prerequisites

- [You installed Kind](/docs/kind/installing).
- [On Windows, you configured Podman](/docs/kind/configuring-podman-for-kind-on-windows).

#### Procedure

1. Go to **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources**
1. In the Kind tile, click on the **Create new ...** button.
1. Choose your options, and click the **Create** button.

   The defaults are:

   - **Name**: `kind-cluster`
   - **Provider Type**: `podman`
   - **HTTP Port**: `9090`
   - **HTTPS Port**: `9443`
   - **Setup an ingress controller [Contour](https://projectcontour.io)**: Enabled
   - **Node’s container image (Available image tags on [kind/releases](https://github.com/kubernetes-sigs/kind/releases))**: Left empty to use latest.

1. (Optionally) Click the **Show logs** button to display the logs.
1. After successful creation, click on the **Go back to resources** button

#### Verification

1. In **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources**, in the **Kind** tile, your `<kind-cluster>` instance is running.
1. In the Podman Desktop tray, open the **Kubernetes** menu, you can set the context to your Kind cluster: `kind-<kind-cluster>`.
