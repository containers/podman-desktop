---
sidebar_position: 102
title: Extensions
description: Troubleshoot extension-related issues
keywords: [podman desktop, podman, extensions, troubleshoot]
tags: [troubleshooting-extension-issues]
---


# Troubleshooting extension-related issues

## Podman Desktop failed to create a Minikube cluster

#### Issue

You might get this error message `Failed to create minikube cluster. E0125 05:58:08.614734 408 cache.go:189] Error downloading kic artifacts: not yet implemented` when creating a new Minikube cluster. You get the error due to instability of the Minikube tool itself.

#### Solution

1. Run the following command to delete the Minikube cluster.
   ```shell-session
   $ minikube delete
   ```
2. Create a new [Minikube cluster](/docs/minikube/installing-extension) using the Podman Desktop UI.