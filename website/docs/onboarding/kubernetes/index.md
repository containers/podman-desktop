---
sidebar_position: 3
title: Onboarding for Kubernetes
description: To run Kubernetes workloads with Kubernetes, set up at least one Kubernetes context.
tags: [podman-desktop, onboarding]
keywords: [podman desktop, kubernetes, onboarding]
---

# Onboarding for Kubernetes workloads

To run Kubernetes workloads, set up at least one Kubernetes context.

Podman Desktop does not automatically set up Kubernetes resources that you might not need.

#### Procedure

To connect to a remote Kubernetes, you can:

- [Select the current Kubernetes context based on your Kube config](/docs/kubernetes/viewing-and-selecting-current-kubernete-context).
- [Setup access to a Red Hat OpenShift Sandbox](/docs/kubernetes/openshift/configuring-access-to-a-developer-sandbox).
- [Setup access to a Kubernetes cluster](/docs/kubernetes/configuring-access-to-a-kubernetes-cluster).

To setup Kubernetes on your workstation, you can:

- [Setup Kind on your container engine](/docs/kubernetes/kind).
- [Setup Minikube on your container engine](/docs/kubernetes/minikube).
- [Setup a Lima machine with k3s or Kubernetes](/docs/onboarding/creating-a-lima-instance-with-podman-desktop).
- [Setup Red Hat OpenShift Local with MicroShift or OpenShift](/docs/kubernetes/openshift/creating-an-openshift-local-cluster).
