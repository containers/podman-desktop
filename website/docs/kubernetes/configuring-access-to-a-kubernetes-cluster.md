---
sidebar_position: 1
title: Configuring access
description: Configuring access to a Kubernetes cluster
keywords: [podman desktop, podman, containers, pods, migrating, kubernetes]
tags: [migrating-to-kubernetes]
---

# Configuring access to a Kubernetes cluster

Podman Desktop configures the access to Kubernetes clusters automatically when:

- [Creating a Kind-powered local Kubernetes cluster](kind/creating-a-kind-cluster).
- [Creating an OpenShift Local cluster](openshift/creating-an-openshift-local-cluster).
- [Configuring access to a Developer Sandbox](openshift/configuring-access-to-a-developer-sandbox).
- [Configuring access to an OpenShift cluster](openshift/configuring-access-to-an-openshift-cluster).

You can also use the Kubernetes CLI to configure access to your Kubernetes cluster:

#### Prerequisites

- You have credentials for your Kubernetes cluster.

#### Procedure

1. (Optionally) Go to **<icon icon="fa-solid fa-cog" size="lg" /> Settings > Preferences > Path to the kubeconfig file** to adapt your kubeconfig file location, when different from the default `$HOME/.kube/config`.
1. Register your _`<my_kubernetes>`_ Kubernetes cluster:

   ```shell-session
   $ kubectl config set-cluster <my_kubernetes> --server=<my_kubernetes_url>
   ```

#### Verification

- You can [view and select the Kubernetes cluster in Podman Desktop](viewing-and-selecting-current-kubernete-context)

#### Additional resopurces

- [Kubernetes documentation: Configure access to multiple clusters](https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/)
