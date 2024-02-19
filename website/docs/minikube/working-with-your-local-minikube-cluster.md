---
sidebar_position: 5
title: Working with a cluster
description: Working with your local Minikube-powered Kubernetes cluster.
keywords: [podman desktop, podman, containers, migrating, kubernetes, minikube]
tags: [migrating-to-kubernetes, minikube]
---

# Working with your local Minikube-powered Kubernetes cluster

Set your Kubernetes context to your local Minikube-powered Kubernetes cluster.

#### Prerequisites

- [You onboarded a Minikube cluster](/docs/minikube/installing).

#### Procedure

1. Open the Podman Desktop tray.
2. Go to **Kubernetes**.
3. Click on the Kubernetes context with the `minikube` name.

#### Verification

- The Kubernetes CLI reports that the current context is your cluster with the `minikube` name:

  ```shell-session
  $ kubectl config current-context
  ```
