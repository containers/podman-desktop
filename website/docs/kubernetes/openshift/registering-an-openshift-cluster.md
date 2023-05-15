---
sidebar_position: 10
title: Registering an OpenShift cluster
description: Registering an OpenShift cluster
keywords: [podman desktop, podman, containers, pods, migrating, kubernetes]
tags: [migrating-to-kubernetes]
---

# Registering an OpenShift cluster

With Podman Desktop, you can register your OpenShift cluster to your kubeconfig file.

#### Prerequisites

- You have credentials for your Kubernetes cluster.

#### Procedure

1. (Optionally) Go to **Settings > Preferences > Path to the kubeconfig file** to adapt your kubeconfig file location when different from the default `$HOME/.kube/config`.

1. Click **door** to login to an OpenShift cluster.
1. Set the Cluster URL
1. (Optionally) When your cluster is using self-signed TLS certificates, set **Skip TLS Verify**.
1. Set your authentication method:
   - _Credentials_: _<Username>_ and _<Password>_
   - _Bearer Token_

#### Verification

- You can select your Kubernetes
