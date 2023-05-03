---
sidebar_position: 10
title: Deploying a pod
description: Deploying a pod to Kubernetes
keywords: [podman desktop, podman, containers, pods, migrating, kubernetes]
tags: [migrating-to-kubernetes]
---

# Deploying a pod to Kubernetes

With Podman Desktop, you can deploy a pod to your Kubernetes cluster.

#### Prerequisites

- Your are using the Podman container engine.
- Your pod, running or stopped, is available on the **Pods** page: _<your_pod>_.
- You registered the Kubernetes cluster in your kubeconfig file: _<your_kubernetes_cluster>_. For example, [Creating a kind cluster](kind/creating-a-kind-cluster.md).
- The Kubernetes namespace to deploy to already exists.

#### Procedure

1. Click **Podman Desktop tray > Kubernetes > Context > _<your_kubernetes_cluster>_** to set your Kubernetes context.
1. Open **Podman Desktop dashboard > Pods > _<your_pod>_** to see the **Pod Details** page.
1. Click <icon icon="fa-solid fa-rocket" size="lg" /> to generate a Kubernetes pod.
1. On the **Deploy generated pod to Kubernetes** screen, choose your options:
   1. **Pod Name**: edit the proposed name.
   1. **Use Kubernetes Services**: enable or disable **Replace `hostPort` exposure on containers by Services. It is the recommended way to expose ports, as a cluster policy might prevent to use `hostPort`.**
   1. **Kubernetes namespace**: select in the list the namespace to deploy the pod to.
1. Click the **<icon icon="fa-solid fa-rocket" size="lg" /> Deploy** button.

#### Verification

- On the **Deploy generated pod to Kubernetes** screen, the created pod status is _Phase: Running_

  ![Deplying a pod](img/deploying-a-pod.png)

- Go to **Pods**: your pod is in the list.
