---
sidebar_position: 10
title: Registering a cluster
description: Registering a Kubernetes cluster
keywords: [podman desktop, podman, containers, pods, migrating, kubernetes]
tags: [migrating-to-kubernetes]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Registering a Kubernetes cluster

You can register manually your Kubernetes cluster when Podman Desktop, when you are not using a method that registers your cluster automatically, such as:

- [Creating a kind cluster](kind/creating-a-kind-cluster).
- [Creating an OpenShift Local cluster](openshift/creating-an-openshift-local-cluster).
- [Creating a free OpenShift cluster on the Developer Sandbox]().
- [Login to an OpenShift cluster](openshift/registering-an-openshift-cluster).

#### Prerequisites

- You have credentials for your Kubernetes cluster.

#### Procedure

1. (Optionally) Go to **Settings > Preferences > Path to the kubeconfig file** to adapt your kubeconfig file location when different from the default `$HOME/.kube/config`.
1. Register your _<my_kubernetes>_ Kubernetes cluster:

   ```shell-session
   $ kubectl config set-cluster <my_kubernetes> --server=<my_kubernetes_url>
   ```
