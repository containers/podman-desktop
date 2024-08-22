---
sidebar_position: 11
title: Deployment object
description: Configuring or editing a deployment object
keywords: [podman desktop, podman, deploying, images, kubernetes]
tags: [configuring-kubernetes, images]
---

# Configuring or editing a `Deployment` object

With Podman Desktop, you can configure a `Deplyoment` object on your Kubernetes cluster. Configuring this object helps you to create necessary pods for execution and scale the number of pods. Based on your needs, you can also edit the object configuration and apply it to your cluster.

#### Prerequisites

- You have set your Kubernetes context in which you want to configure the `Deployment` object. See [Viewing and selecting the current Kubernetes context](/docs/kubernetes/viewing-and-selecting-current-kubernete-context-in-the-status-bar).
- Your have created a `Deployment` object configuration file.

#### Procedure: Configuring a new object

1. In the Kubernetes explorer, click **Deployments**.
2. Click the **Apply YAML** button and select a `Deployment` object configuration file. A confirmation notification opens.
3. Click **Ok**.

#### Procedure: Editing an existing object

1. In the Kubernetes explorer, click **Deployments**.
2. Click the name of the `Deployment` object.
3. Select the **Kube** tab and edit the configuration file.
4. Click **Apply changes to cluster**.

#### Verification

1. View the created object on the **Deployments** page.
1. Optional: Click the name of the object to view its detailed summary.
