---
sidebar_position: 13
title: Ingress object
description: Configuring or editing an ingress object
keywords: [podman desktop, podman, deploying, images, kubernetes]
tags: [configuring-kubernetes, images]
---

# Configuring or editing an `Ingress` object

With Podman Desktop, you can configure an `Ingress` object on your Kubernetes cluster. Configuring this object helps you to define routing rules and manage user access to the services running in a Kubernetes cluster. You can also edit the object configuration and apply it to your cluster.

#### Prerequisites

- You have set your Kubernetes context in which you want to configure the `Ingress` object. See [Viewing and selecting the current Kubernetes context](/docs/kubernetes/viewing-and-selecting-current-kubernete-context-in-the-status-bar).
- Your have created an `Ingress` object configuration file.

#### Procedure: Configuring a new object

1. In the Kubernetes explorer, click **Ingresses & Routes**.
2. Click the **Apply YAML** button and select an `Ingress` object configuration file. A confirmation notification opens.
3. Click **Ok**.

#### Procedure: Editing an existing object

1. In the Kubernetes explorer, click **Ingresses & Routes**.
1. Click the name of the `Ingress` object.
1. Select the **Kube** tab and edit the configuration file.
1. Click **Apply changes to cluster**.

#### Verification

1. View the created object on the **Ingresses & Routes** page.
1. Optional: Click the name of the object to view its detailed summary.
