---
sidebar_position: 30
title: Custom Lima instance
description: Podman Desktop can assist you to create a custom Lima instance on Linux and macOS.
tags: [podman-desktop, kubernetes, onboarding, linux, macOS]
keywords: [podman desktop, kubernetes, lima, onboarding, linux, macos]
---

# Creating a Lima instance for Kubernetes workloads with Podman Desktop

To use the Lima provider you need a Lima instance running a Linux virtual machine.

In the future, Podman Desktop might be able to create Lima instances.

Consider creating a custom Lima instance to:

- Control the assigned resources: CPUs, memory, and disk size.

#### Prerequisites

- The `limactl` executable is installed.
  See [Installing Lima](https://lima-vm.io/docs/installation/).

  ```shell-session
  $ brew install lima
  ```

#### Procedure

1. In a terminal, create the Lima instance.

   - To create a single-node Kubernetes cluster running [k3s](https://k3s.io/):

     ```shell-session
     $ limactl start template://k3s
     ```

   - To create a single-node Kubernetes cluster running [k8s](https://k8s.io/):

     ```shell-session
     $ limactl start template://k8s
     ```

2. Wait for the instance to start, and restart the Lima extension.

#### Verification

1. When the installation is done, the location of the KUBECONFIG file is printed. See [Configuring access to a Kubernetes cluster](/docs/kubernetes/configuring-access-to-a-kubernetes-cluster).

1. Use the `kubectl.lima` wrapper script to connect to the cluster:

   ```shell-session
   $ kubectl.lima version
   ```
