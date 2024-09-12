---
sidebar_position: 11
title: Creating a Kubernetes cluster
description: Creating a Kubernetes cluster
keywords: [podman desktop, podman, creating, cluster, kubernetes]
tags: [creating-kubernetes-cluster, extentions]
---

# Creating a Kubernetes cluster using extensions

Podman Desktop provides extensions, such as Kind, MiniKube, and others to start a local Kubernetes development cluster. The following table covers the procedural sections for setting up a Kubernetes cluster:

| Extension |                                                                                                                            Procedural sections to follow                                                                                                                            |
| :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Kind      |                 [Install the Kind extension](/docs/extensions/install) > [Install the Kind CLI](/docs/kind/installing) > [Configure Podman on WSL](/docs/kind/configuring-podman-for-kind-on-windows) > [Create a Kind cluster](/docs/kind/creating-a-kind-cluster)                 |
| Minikube  | [Install the Minikube extension](/docs/extensions/install) > [Install the Minikube CLI](/docs/minikube/installing) > [Configure Podman on WSL](/docs/minikube/configuring-podman-for-minikube-on-windows) > [Create a Minikube cluster](/docs/minikube/creating-a-minikube-cluster) |
| Lima      |                                             [Install the Lima extention](/docs/extensions/install) > [Install the Lima CLI](/docs/lima/installing) > [Create a Lima instance for Kubernetes](/docs/lima/creating-a-kubernetes-instance)                                             |

:::note

The _Configure Podman on WSL_ procedure is applicable only if you have installed the Podman Desktop application on a Windows machine. For MacOS and Linux, you can skip this procedure.

:::
