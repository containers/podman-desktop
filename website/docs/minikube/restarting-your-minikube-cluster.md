---
sidebar_position: 6
title: Restarting a cluster
description: Restarting your local Minikube-powered Kubernetes cluster.
keywords: [podman desktop, podman, containers, migrating, kubernetes, minikube]
tags: [migrating-to-kubernetes, minikube]
---

# Restarting your local Minikube-powered Kubernetes cluster

With Podman Desktop, you can restart your local Minikube-powered Kubernetes cluster.

#### Procedure

1. Open **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources**.
1. Find the Minikube cluster to restart.
1. Click <Icon icon="fa-solid fa-repeat" size="lg" />.

#### Verification

1. Open **Containers**.
1. Find the Minikube cluster that restarted.
1. The cluster **Age** is consistent with the restart time.
1. Open **Pods**.
1. Find the pods that are running on your Minikube cluster.

#### Workaround

Minikube has no command to restart a cluster.
Therefore, Podman Desktop stops the Minikube cluster, and starts it again.
The Minikube cluster might not restart successfully.
In that case:

- Consider replacing Minikube with a local Kubernetes cluster that you can restart, such as [OpenShift Local](https://developers.redhat.com/products/openshift-local/).
- Consider [deleting your Minikube cluster](/docs/minikube/deleting-your-minikube-cluster), and [creating a Minikube cluster](/docs/minikube/creating-a-minikube-cluster).
