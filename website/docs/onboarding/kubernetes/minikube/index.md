---
title: Minikube
description: Minikube is one way to get Kubernetes running on your workstation.
keywords: [podman desktop, podman, containers, migrating, kubernetes, minikube]
tags: [migrating-to-kubernetes, minikube]
---

# Onboarding Kubernetes on your workstation with Minikube and Podman

Podman Desktop can help you run [Minikube-powered](https://minikube.sigs.k8s.io/) local Kubernetes clusters on a container engine, such as Podman.

#### Procedure

1. Go to **<icon icon="fa-solid fa-cog" size="lg" /> Settings > Extensions**.
1. Install the _Minikube_ extension:
   1. Go to **Install a new extension from OCI Image**
   1. Enter the **Name of the Image**: `ghcr.io/containers/podman-desktop-extension-minikube`
   1. Click **<icon icon="fa-solid fa-download" size="lg" /> Install extension from the OCI image**
1. [Install the `minikube` CLI](/docs/onboarding/kubernetes/minikube/installing-minikube).
1. [On Windows, configure Podman in rootful mode](/docs/onboarding/kubernetes/minikube/configuring-podman-for-minikube-on-windows).
1. [Create a Minikube cluster](/docs/onboarding/kubernetes/minikube/creating-a-minikube-cluster).

#### Next steps

1. [Work with your Minikube cluster](/docs/kubernetes/minikube).
1. [Restart your Minikube cluster](/docs/onboarding/kubernetes/minikube/restarting-your-minikube-cluster).
1. [Delete your Minikube cluster](/docs/onboarding/kubernetes/minikube/deleting-your-minikube-cluster).
