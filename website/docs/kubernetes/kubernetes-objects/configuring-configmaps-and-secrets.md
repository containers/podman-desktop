---
sidebar_position: 15
title: ConfigMap and Secret objects
description: Configuring or editing a configmap object
keywords: [podman desktop, podman, deploying, images, kubernetes]
tags: [configuring-kubernetes, images]
---

# Configuring or editing a `ConfigMap` or `Secret` object

With Podman Desktop, you can configure a `ConfigMap` or `Secret` object on your Kubernetes cluster.

- Configuring the `ConfigMap` object helps you to define non-sensitive configuration data for initializing or executing your application.
- Configuring the `Secret` object helps you to store and manage sensitive data, such as passwords, OAuth tokens, and SSH keys for your application.

Based on your needs, you can also edit the `ConfigMap` or `Secret` object configuration and apply it to your cluster.

#### Prerequisites

- You have set your Kubernetes context in which you want to configure the `ConfigMap` object. See [Viewing and selecting the current Kubernetes context](/docs/kubernetes/viewing-and-selecting-current-kubernete-context-in-the-status-bar).
- Your have created a `ConfigMap` or `Secret` object configuration file.

#### Procedure: Configuring a new object

1. In the Kubernetes explorer, click **Configmaps & Secrets**.
2. Click the **Apply YAML** button and select a `ConfigMap` or `Secret` object configuration file. A confirmation notification opens.
3. Click **Ok**.

#### Procedure: Editing an existing object

1. In the Kubernetes explorer, click **Configmaps & Secrets**.
1. Click the name of the `ConfigMap` or `Secret` object.
1. Select the **Kube** tab and edit the configuration file.
1. Click **Apply changes to cluster**.

#### Verification

1. View the created object on the **Configmaps & Secrets** page.
1. Optional: Click the name of the object to view its detailed summary.
