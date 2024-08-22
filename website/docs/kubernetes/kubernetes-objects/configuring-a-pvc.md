---
sidebar_position: 14
title: PersistentVolumeClaim object
description: Configuring or editing a PVC object
keywords: [podman desktop, podman, deploying, images, kubernetes]
tags: [configuring-kubernetes, images]
---

# Configuring or editing a `PersistentVolumeClaim` object

With Podman Desktop, you can configure a `PersistentVolumeClaim` object on your Kubernetes cluster. Configuring this object helps you to request `PersistentVolume` resources for storage and define volume access modes within your Kubernetes cluster. You can also edit the object configuration and apply it to your cluster.

#### Prerequisites

- You have set your Kubernetes context in which you want to configure the `PersistentVolumeClaim` object. See [Viewing and selecting the current Kubernetes context](/docs/kubernetes/viewing-and-selecting-current-kubernete-context-in-the-status-bar).
- Your have created a `PersistentVolumeClaim` object configuration file.

#### Procedure: Configuring a new object

1. In the Kubernetes explorer, click **Persistent Volume Claims**.
2. Click the **Apply YAML** button and select a `PersistentVolumeClaim` object configuration file. A confirmation notification opens.
3. Click **Ok**.

#### Procedure: Editing an existing object

1. In the Kubernetes explorer, click **Persistent Volume Claims**.
1. Click the name of the `PersistentVolumeClaim` object.
1. Select the **Kube** tab and edit the configuration file.
1. Click **Apply changes to cluster**.

#### Verification

1. View the created object on the **PersistentVolumeClaims** page.
1. Optional: Click the name of the object to view its detailed summary.
