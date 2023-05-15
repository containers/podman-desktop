---
sidebar_position: 10
title: Creating an OpenShift Local cluster
description: Creating an OpenShift Local cluster
keywords: [podman desktop, podman, containers, pods, migrating, kubernetes, openshift]
tags: [migrating-to-kubernetes]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Registering a Kubernetes cluster

You can register manually your Kubernetes cluster when Podman Desktop, when you are not using a method that registers your cluster automatically, such as:

- [Creating a kind cluster](../kind/creating-a-kind-cluster).
- Creating an OpenShift Local cluster.
- Creating a free OpenShift cluster on the Developer Sandbox.
- Login to an OpenShift cluster.

#### Prerequisites

- You have credentials for your Kubernetes cluster.

#### Procedure

1. (Optionally) Go to **Settings > Preferences > Path to the kubeconfig file** to adapt your kubeconfig file location when different from the default `$HOME/.kube/config`.
1. Register your _<my_kubernetes>_ Kubernetes cluster:

   ```shell-session
   $ kubectl config set-cluster <my_kubernetes> --server=<my_kubernetes_url>
   ```
