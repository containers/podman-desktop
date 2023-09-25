---
sidebar_position: 30
title: Custom Lima instance
description: Podman Desktop can assist you to create a custom Lima instance on Linux and macOS.
tags: [podman-desktop, podman, onboarding, containers, linux, macOS]
keywords: [podman desktop, containers, lima, onboarding, linux, macos]
---

# Creating a Lima instance for container workloads with Podman Desktop

To use the Lima provider you need a Lima instance running a Linux virtual machine.

In the future, Podman Desktop might be able to create Lima instances.

Consider creating a custom Lima instance to:

- Control the assigned resources: CPUs, memory, and disk size.
- Use the rootful connection by default, for example to run Kind.

#### Prerequisites

- The `limactl` executable is installed.
  See [Installing Lima](https://lima-vm.io/docs/installation/).

  ```shell-session
  $ brew install lima
  ```

#### Procedure

1. In a terminal, create the Lima instance.

   - To create a Lima instance with rootless Podman, use the `podman` template:

     ```shell-session
     $ limactl start --name=podman template://podman
     ```

   - To create a Lima instance with rootful Podman, use the `podman-rootful` template:

     ```shell-session
     $ limactl start --name=podman template://podman-rootful
     ```

   - To create an Lima instance with rootless Docker, use the `docker` template:

     ```shell-session
     $ limactl start --name=docker template://docker
     ```

   - To select the number of CPUs, the memory, and the disk size, add the `--set` option to the `limactl start` command:

     ```shell-session
     --set='.cpus = 2 | .memory = "2GiB" | .disk = "50GiB"'
     ```

2. Wait for the instance to start, and restart the Lima extension.

#### Verification

- To verify the connection to a running "podman" instance:

  ```shell-session
  $ podman.lima version
  ```

- To verify the connection to a running "docker" instance:

  ```shell-session
  $ docker.lima version
  ```
