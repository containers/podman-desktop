---
sidebar_position: 4
title: Creating a Kind cluster
description: Creating a local Kind-powered Kubernetes cluster.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Creating a local Kind-powered Kubernetes cluster 

You can create multiple local Kind-powered Kubernetes clusters.

#### Prerequisites

* [You installed Kind](installing-kind).
* [On Windows, you configured Podman](configuring-podman-for-kind-on-windows).

#### Procedure
1. Go to **Settings > Resources**
1. In the Kind tile, click on the **Create new ...** button.
1. Choose your options, and click the **Create** button.

   The defaults are:
   * Name: `kind-cluster`
   * Provider type: `podman`
   * HTTP port: `9090`
   * HTTPS port: `9443`
1. (Optionally) Click the **Show logs** button to display the logs.
1. After successful creation, click on the **Go back to resources** button

#### Verification

1. In **Settings > Resources**, in the **Kind** tile, your `<kind-cluster>` instance is running.
1. In the Podman Desktop tray, open the  **Kubernetes** menu, you can set the context to your Kind cluster: `kind-<kind-cluster>`.
