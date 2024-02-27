---
sidebar_position: 5
title: Restarting a cluster
description: Restarting your local Kind-powered Kubernetes cluster.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Restarting your local Kind-powered Kubernetes cluster

With Podman Desktop, you can restart your local Kind-powered Kubernetes cluster.

#### Procedure

1. Open **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources**.
1. Find the Kind cluster to restart.
1. Click <Icon icon="fa-solid fa-repeat" size="lg" />.

#### Verification

1. Open **Containers**.
1. Find the Kind cluster that restarted.
1. The cluster **Age** is consistent with the restart time.
1. Open **Pods**.
1. Find the pods that are running on your Kind cluster.

#### Workaround

Kind has no command to restart a cluster.
Therefore, Podman Desktop stops the Kind cluster, starts it again, and hopes for the best.
The Kind cluster might not restart successfully.
In that case:

- Consider replacing Kind with a local Kubernetes cluster that you can restart, such as [OpenShift Local](https://developers.redhat.com/products/openshift-local/).
- Consider [deleting your Kind cluster](/docs/kind/deleting-your-kind-cluster), and [creating a Kind cluster](/docs/kind/creating-a-kind-cluster).
