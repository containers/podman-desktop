---
sidebar_position: 2
title: Installing the CLI
description: Minikube is one way to get Kubernetes running on your workstation.
keywords: [podman desktop, podman, containers, migrating, kubernetes, minikube]
tags: [migrating-to-kubernetes, minikube]
---

# Installing the `minikube` CLI

#### Procedure

- In the status bar, click on **Minikube**, and follow the prompts.
  ![Minikube in the status bar](img/minikube-status-bar.png)

#### Verification

1. The status bar doesn't display **Minikube**.
1. **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Resources** contain a **Minikube** tile.
   ![Minikube resource tile](img/minikube-resource.png)
1. You can run the `minikube` CLI:

   ```shell-session
   $ minikube profile list
   ```
