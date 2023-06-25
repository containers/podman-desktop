---
sidebar_position: 10
title: Custom Lima instance
description: Podman Desktop can assist you to create custom Lima instance on Linux and macOS.
tags: [podman-desktop, podman, installing, linux, macOS]
keywords: [podman desktop, containers, lima, installing, installation, linux, macos]
---

# Creating a Lima instance with Podman Desktop

To use the Lima provider you need a Lima instance running a Linux virtual machine.

In the future, Podman Desktop might be able to create Lima instances.

Consider creating a custom Lima instance to:

- Control the assigned resources: CPUs, memory, and disk size.
- Use the rootful connection by default, for example to run Kind.

#### Prerequisites

- The `limactl` executable is installed.

```shell
brew install lima
```

See <https://lima-vm.io>

#### Procedure

Currently you need to use the console, to create a new Lima instance.

After the instance is started, you need to restart the Lima extension.

Examples:

To create an instance "podman" from a template "podman":

```console
$ limactl start --name=podman template://podman
```

To create an instance "docker" from a template "docker":

```console
$ limactl start --name=docker template://docker
```

To select the number of CPUs and the memory or disk size:

```console
$ limactl start --set='.cpus = 2 | .memory = "2GiB" | .disk = "50GiB"' ...
```

To create a rootful instance, use the rootful template:

```console
$ limactl start --name=podman template://podman-rootful
```

#### Verification

To verify the connection to a running "podman" instance:

```console
$ podman.lima version
```

To verify the connection to a running "docker" instance:

```console
$ docker.lima version
```

#### Kubernetes

To create a single-node Kubernetes cluster running [k3s](https://k3s.io/):

```console
$ limactl start template://k3s
```

To create a single-node Kubernetes cluster running [k8s](https://k8s.io/):

```console
$ limactl start template://k8s
```

When the installation is done, the location of the KUBECONFIG file is printed:

- [Configuring access to a Kubernetes cluster](/docs/kubernetes/configuring-access-to-a-kubernetes-cluster)

You can also use the `kubectl.lima` wrapper script, to connect to the cluster:

```console
$ kubectl.lima version
```
