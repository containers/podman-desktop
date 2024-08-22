---
sidebar_position: 12
title: Service object
description: Configuring or editing a service object
keywords: [podman desktop, podman, deploying, images, kubernetes]
tags: [configuring-kubernetes, images]
---

# Configuring or editing a `Service` object

With Podman Desktop, you can configure a `Service` object on your Kubernetes cluster. Configuring this object helps you to expose your application to users and define policies for application access. You can also edit the object configuration and apply it to your cluster.

#### Prerequisites

- You have set your Kubernetes context in which you want to configure the `Service` object. See [Viewing and selecting the current Kubernetes context](/docs/kubernetes/viewing-and-selecting-current-kubernete-context-in-the-status-bar).
- Your have created a `Service` object configuration file.

#### Procedure: Configuring a new object

1. In the Kubernetes explorer, click **Services**.
2. Click the **Apply YAML** button and select a `Service` object configuration file. A confirmation notification opens.
3. Click **Ok**.

#### Procedure: Editing an existing object

1. In the Kubernetes explorer, click **Services**.
1. Click the name of the `Service` object.
1. Select the **Kube** tab and edit the configuration file.
1. Click **Apply changes to cluster**.

#### Verification

1. View the created object on the **Services** page.
1. Optional: Click the name of the object to view its detailed summary.
