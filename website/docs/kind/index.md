---
sidebar_position: 70
title: Kind
description: Kind is one way to get Kubernetes running on your workstation.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Running Kubernetes on your workstation with Kind and Podman

Podman Desktop can help you run [Kind-powered](https://kind.sigs.k8s.io/) local Kubernetes clusters on a container engine, such as Podman.

#### Procedure

1. [Install the `kind` CLI](/docs/kind/installing).
2. [On Windows, configure Podman in rootful mode](/docs/kind/configuring-podman-for-kind-on-windows).
3. [Create a Kind cluster](/docs/kind/creating-a-kind-cluster).

#### Next steps

1. [Set your Kubernetes context to your local Kind-powered Kubernetes cluster](/docs/kind/working-with-your-local-kind-cluster).
1. [Build an image and test it in Kind](/docs/kind/building-an-image-and-testing-it-in-kind).
1. [Push an image to Kind](/docs/kind/pushing-an-image-to-kind).
1. [Restart your Kind cluster](/docs/kind/restarting-your-kind-cluster).
1. [Delete your Kind cluster](/docs/kind/deleting-your-kind-cluster).
