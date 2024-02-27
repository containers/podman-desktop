---
sidebar_position: 1
title: Installing the CLI
description: Installing Lima
keywords: [podman desktop, podman, containers, migrating, kubernetes, lima]
tags: [migrating-to-kubernetes, lima]
---

# Installing the `lima` CLI

#### Procedure

- The `limactl` executable is installed.
  See [Installing Lima](https://lima-vm.io/docs/installation/).

  ```shell-session
  $ brew install lima
  ```

#### Verification

1. You can run the `limactl` CLI:

   ```shell-session
   $ limactl list
   ```

1. (Optionally) To open a shell:

   ```shell-session
   $ # requires a running instance
   $ export LIMA_INSTANCE=<instance>
   $ lima
   ```
