---
sidebar_position: 4
title: Customizing Lima instance
description: Customizing Lima
keywords: [podman desktop, containers, kubernetes, lima]
tags: [lima]
---

# Customizing the Lima instance for varying workloads

You can customize Lima instance, using YAML and `yq`.

For more information on yq, see the yq [documentation](https://mikefarah.gitbook.io/yq/).

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

See also:

- [Lima documentation](https://lima-vm.io/docs/)
- [Lima GUI](https://github.com/afbjorklund/lima-gui) (with editor)

### Directory

To find the location of the instance directory (`Dir`):

```bash
limactl list <instance> --format '{{.Dir}}'
```

### Resources

The resources can be set per instance, or as a global default.

```yaml
# CPUs
# 🟢 Builtin default: min(4, host CPU cores)
cpus: null

# Memory size
# 🟢 Builtin default: min("4GiB", half of host memory)
memory: null

# Disk size
# 🟢 Builtin default: "100GiB"
disk: null
```

To set the default, edit `_config/default.yaml` in Lima home.

```yaml
# The builtin defaults can be changed globally by creating a $LIMA_HOME/_config/default.yaml
# file. It will be used by ALL instances under the same $LIMA_HOME, and it
# will be applied on each `limactl start`, so can affect instance restarts.

# A similar mechanism is $LIMA_HOME/_config/override.yaml, which will take
# precedence even over the settings in an instances lima.yaml file.
# It too applies to ALL instances under the same $LIMA_HOME, and is applied
# on each restart. It can be used to globally override settings, e.g. make
# the mount of the home directory writable.
```

### VM and Mount

Any virtual machine (or server) with ssh can be used for Lima.

Most compatible mount type is "reverse-sshfs" (from [sshocker](https://github.com/lima-vm/sshocker)).

Optionally you can use "qemu" vm with "9p" (aka virtfs) mount.

On macOS 13+, you can also use "vz" vm with "virtiofs" mount.

```yaml
# VM type: "qemu" or "vz" (on macOS 13 and later).
# The vmType can be specified only on creating the instance.
# The vmType of existing instances cannot be changed.
# 🟢 Builtin default: "qemu"
vmType: null

# Mount type for above mounts, such as "reverse-sshfs" (from sshocker),
# "9p" (EXPERIMENTAL, from QEMU’s virtio-9p-pci, aka virtfs),
# or "virtiofs" (EXPERIMENTAL, needs `vmType: vz`)
# 🟢 Builtin default: "reverse-sshfs" (for QEMU), "virtiofs" (for vz)
mountType: null
```

### Containers

You can install a container engine, in addition to the existing runtime.

For instance you can install [Podman Engine](https://github.com/containers/podman),
or you can install [Docker Engine](https://github.com/docker/docker).
After that you can port forward the socket, to the host `Dir`.

#### Docker

```yaml
portForwards:
  - guestSocket: '/var/run/docker.sock'
    hostSocket: '{{.Dir}}/sock/docker.sock'
```

- `/var/run/docker.sock`

```bash
export DOCKER_HOST="unix://{{.Dir}}/sock/docker.sock"
```

#### Podman

```yaml
portForwards:
  - guestSocket: '/run/podman/podman.sock'
    hostSocket: '{{.Dir}}/sock/podman.sock'
```

- `/run/podman/podman.sock`

```bash
export CONTAINER_HOST="unix://{{.Dir}}/sock/podman.sock"
```

### Kubernetes

You can install Kubernetes, on top of the existing container engine.

For instance you can use [CRI-O](https://github.com/cri-o/cri-o) for Podman,
or [CRI-Dockerd](https://github.com/Mirantis/cri-dockerd) for Docker.
After that you can copy the `kubeconfig.yaml` file, to the host `Dir`.

#### k3s.io

```yaml
copyToHost:
  - guest: '/etc/rancher/k3s/k3s.yaml'
    host: '{{.Dir}}/copied-from-guest/kubeconfig.yaml'
    deleteOnStop: true
```

- `/etc/rancher/k3s/k3s.yaml`

```bash
export KUBECONFIG="{{.Dir}}/copied-from-guest/kubeconfig.yaml"
```

#### k8s.io

```yaml
copyToHost:
  - guest: '/etc/kubernetes/admin.conf'
    host: '{{.Dir}}/copied-from-guest/kubeconfig.yaml'
    deleteOnStop: true
```

- `/etc/kubernetes/admin.conf`

```bash
export KUBECONFIG="{{.Dir}}/copied-from-guest/kubeconfig.yaml"
```
