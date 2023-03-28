---
sidebar_position: 1
title: Kind
description: Kind is one way to get Kubernetes running on your workstation.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Running Kubernetes on your workstation with Kind and Podman

[Kind](https://kind.sigs.k8s.io/) is a command line tool for running local Kubernetes clusters on a container engine, such as Podman.

## Configuring Podman for Kind on Windows Subsystem for Linux (WSL) {#configuring}

When you create a Podman machine, Podman creates two system connections:

* The default rootless connection.
* A rootful connection, which has a `-root` suffix.

With a Podman machine running on WSL, Kind:

* Uses the default Podman connection.
* Requires the rootful connection.

Therefore, set the Podman machine default connection to rootful.

#### Procedure

1. List the Podman system connections:

   ```shell-session
   $ podman system connection ls
   ```

2. Set the Podman system default connection to connection that has the `-root` suffix:

   ```shell-session
   $ podman system connection default podman-machine-default-root
   ```

#### Next steps

* [Create your Kind cluster](#kind-create-cluster)

## Creating a local Kubernetes cluster with Kind {#kind-create-cluster}

#### Prerequisites

* [You configured Podman](#configuring).
* [You installed Kind](https://kind.sigs.k8s.io/).

#### Procedure

* Create a Kind cluster

   ```shell-session
   $ kind create cluster
   ```

#### Next steps

* [Work with your Kind cluster](#set-current-context)

## Working with your local Kind-powered Kubernetes cluster {#set-current-context}

Set your Kubernetes context to your local Kind-powered Kubernetes cluster.

#### Procedure

1. Open the Podman Desktop tray.
2. Go to **Kubernetes**.
3. Click on the Kubernetes context with the `kind` suffix.

#### Verification

* The Kubernetes CLI reports that the current context is your cluster with the `kind` suffix:

   ```shell-session
   $ kubectl config current-context
   ```

## Deleting a local Kubernetes cluster with Kind {#kind-delete-cluster}

#### Prerequisites

* [You configured Podman](#configuring).
* [You installed Kind](https://kind.sigs.k8s.io/).

#### Procedure

* Delete the Kind cluster

   ```shell-session
   $ kind delete cluster
   ```

## Restarting your local Kubernetes cluster with Kind {#restarting-kind}

Kind has no command to restart a cluster.


#### Workaround

* Consider replacing Kind with a local Kubernetes cluster that you can restart, such as [OpenShift Local](https://developers.redhat.com/products/openshift-local/).
* Consider [deleting your Kind cluster](#kind-delete-cluster), and [creating a Kind cluster](#kind-create-cluster).
