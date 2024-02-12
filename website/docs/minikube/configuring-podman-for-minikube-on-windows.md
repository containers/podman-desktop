---
sidebar_position: 3
title: Configuring Podman
description: Configuring Podman for Minikube on Windows Subsystem for Linux (WSL).
keywords: [podman desktop, podman, containers, migrating, kubernetes, minikube]
tags: [migrating-to-kubernetes, minikube]
---

# Configuring Podman for Minikube on Windows Subsystem for Linux (WSL)

When you create a Podman machine, Podman creates the machine in rootless mode.

With a Podman machine running on WSL, Minikube:

- Requires a rootful machine.

Therefore, set the Podman machine to rootful mode.

#### Procedure

1. Stop the Podman machine:

   ```shell-session
   $ podman machine stop
   ```

2. Set the Podman machine in rooful mode:

   ```shell-session
   $ podman machine set --rootful
   ```

3. Start the Podman machine:

   ```shell-session
   $ podman machine start
   ```
