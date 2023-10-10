---
title: Existing Kubernetes or OpenShift
description: Configuring access to a Kubernetes or OpenShift cluster
keywords: [podman desktop, podman, containers, pods, migrating, kubernetes]
tags: [migrating-to-kubernetes]
---

# Configuring access to a Kubernetes or OpenShift cluster

Podman Desktop configures the access to Kubernetes or OpenShift clusters automatically when:

- [Creating a Kind-powered local Kubernetes cluster](/docs/onboarding/kubernetes/kind/creating-a-kind-cluster).
- [Creating an OpenShift Local cluster](/docs/kubernetes/openshift/creating-an-openshift-local-cluster).
- [Configuring access to a Developer Sandbox](/docs/kubernetes/openshift/configuring-access-to-a-developer-sandbox).

You can also use the Kubernetes or OpenShift CLI to configure access to your cluster:

#### Prerequisites

- You have credentials for your Kubernetes or OpenShift cluster.

#### Procedure

1. (Optionally) Go to **<icon icon="fa-solid fa-cog" size="lg" /> Settings > Preferences > Path to the kubeconfig file** to adapt your kubeconfig file location, when different from the default `$HOME/.kube/config`.
1. Register your _`<my_kubernetes>`_ Kubernetes or OpenShift cluster:

   ```shell-session
   $ kubectl config set-cluster <my_kubernetes> --server=<my_kubernetes_url>
   ```

#### Verification

- You can [view and select the Kubernetes or OpenShift cluster in Podman Desktop](/docs/kubernetes/viewing-and-selecting-current-kubernete-context)

#### Additional resopurces

- [Kubernetes documentation: Configure access to multiple clusters](https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/)
