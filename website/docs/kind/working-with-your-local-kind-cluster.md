---
sidebar_position: 5
title: Working with a cluster
description: Working with your local Kind-powered Kubernetes cluster.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Working with your local Kind-powered Kubernetes cluster

Set your Kubernetes context to your local Kind-powered Kubernetes cluster.

#### Prerequisites

- [You onboarded a Kind cluster](/docs/kind).
- [You have set your Kubernetes context to your local Kind-powered Kubernetes cluster](/docs/kind/working-with-your-local-kind-cluster).

#### Procedure

1. Open the Podman Desktop tray.
2. Go to **Kubernetes**.
3. Click on the Kubernetes context with the `kind` prefix.

#### Verification

- The Kubernetes CLI reports that the current context is your cluster with the `kind` suffix:

  ```shell-session
  $ kubectl config current-context
  ```
