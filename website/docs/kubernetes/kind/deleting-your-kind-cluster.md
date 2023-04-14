---
sidebar_position: 6
title: Deleting your Kind cluster
description: Deleting your local Kind-powered Kubernetes cluster.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Deleting your local Kind-powered Kubernetes cluster

#### Prerequisites

* [You configured Podman](creating-a-kind-cluster.md).
* [You installed Kind](https://kind.sigs.k8s.io/).

#### Procedure

* Delete the Kind cluster

   ```shell-session
   $ kind delete cluster
   ```
