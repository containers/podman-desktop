---
sidebar_position: 4
title: Customizing Lima instance
description: Customizing Lima
keywords: [podman desktop, containers, kubernetes, lima]
tags: [lima]
---

# Customizing the Lima instance for varying workloads

You can customize Lima instance, using YAML and `yq`.

#### Procedure

- To create a new instance:

  ```shell-session
  $ limactl create <instance>
  ```

- To edit an existing instance:

  ```shell-session
  $ limactl edit <instance>
  ```

Some of the things you can edit:

- Change the number of CPUs, the memory, and the disk size
- Change the operating system (the Linux distribution)
- Modify the cluster setup (the Kubernetes distribution)
- Run **both** of container workloads and Kubernetes workloads

### Directory

To find the location of the instance directory (`Dir`):

```bash
limactl list <instance> --format '{{.Dir}}'
```

### Containers

You can install a container engine, in addition to the existing runtime.

For instance you can install [Podman Engine](https://github.com/containers/podman),
or you can install [Docker Engine](https://github.com/docker/docker).
After that you can port forward the socket, to the host `Dir`.

- `/var/run/docker.sock`
- `/run/podman/podman.sock`

```bash
export DOCKER_HOST="unix://{{.Dir}}/sock/docker.sock"
export CONTAINER_HOST="unix://{{.Dir}}/sock/podman.sock"
```

### Kubernetes

You can install Kubernetes, on top of the existing container engine.

For instance you can use [CRI-O](https://github.com/cri-o/cri-o) for Podman,
or [CRI-Dockerd](https://github.com/Mirantis/cri-dockerd) for Docker.
After that you can copy the `kubeconfig.yaml` file, to the host `Dir`.

- `/etc/rancher/k3s/k3s.yaml`
- `/etc/kubernetes/admin.conf`

```bash
export KUBECONFIG="{{.Dir}}/copied-from-guest/kubeconfig.yaml"
```
