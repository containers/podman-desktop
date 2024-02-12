---
sidebar_position: 6
title: Deleting a cluster
description: Deleting your local Kind-powered Kubernetes cluster.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Deleting your local Kind-powered Kubernetes cluster

#### Prerequisites

- [You configured Podman](/docs/kind/creating-a-kind-cluster).
- [You installed Kind](https://kind.sigs.k8s.io/).

#### Procedure

1. Open **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources**.
1. Find the Kind cluster to delete.
1. Click <Icon icon="fa-solid fa-stop" size="lg" /> to stop the cluster.
1. Once the cluster is stopped, click <Icon icon="fa-solid fa-trash" size="lg" /> to delete it.

#### Verification

1. In **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources**, the deleted Kind cluster is not visible.
