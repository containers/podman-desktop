---
sidebar_position: 12
title: Configuring or editing an object
description: Configuring or editing a kubernetes object
keywords: [podman desktop, podman, deploying, images, kubernetes]
tags: [configuring-kubernetes, images]
---

# Configuring or editing a Kubernetes object

With Podman Desktop, you can enhance your Kubernetes management experience by using the features that are part of the Kubernetes explorer. As a developer, you can easily transition from containers to Kubernetes and deploy a complete Kubernetes environment with necessary objects. You have the ability:

- To control and manage your application resources visually
- To configure the following Kubernetes objects:
  - `Node`: Use this object to set up a node on which the necessary pods can run within a kubernetes cluster.
  - `Deplyoment`: Use this object to create necessary pods for execution and scale the number of pods.
  - `Service`: Use this object to expose your application to users and define policies for application access.
  - `Ingress`: Use this object to define routing rules and manage user access to the services running in a Kubernetes cluster.
  - `PersistentVolumeClaim`: Use this object to request `PersistentVolume` resources for storage and define volume access modes within your Kubernetes cluster.
  - `ConfigMap`: Use this object to to define non-sensitive configuration data for initializing or executing your application.
  - `Secret`: Use this object to store and manage sensitive data, such as passwords, OAuth tokens, and SSH keys for your application.
- To view and analyze real-time information about the connection status of the resources configured within the cluster
- To get resource details using the _Summary_ and _Inspect_ tabs
- To edit and apply configuration changes directly using the _Kube_ tab
- To select multiple configuration files and apply them to your cluster in a single step

#### Prerequisites

- You have set your Kubernetes context in which you want to configure a Kubernetes object. See [Viewing and selecting the current Kubernetes context](/docs/kubernetes/viewing-and-selecting-current-kubernete-context-in-the-status-bar).
- Your have created an object configuration file.

#### Procedure: Configuring a new object

1. In the Kubernetes explorer, click one of the options to open the respective object page.
   ![kube objects](img/kube-objects.png)
2. Click the **Apply YAML** button and select an object configuration file. A confirmation notification opens.
   ![configuring a node](img/example-config-node.png)
3. Click **Ok**.

#### Procedure: Editing an existing object

1. In the Kubernetes explorer, click one of the options to open the respective object page.
2. Click the name of the object.
3. Select the **Kube** tab and edit the configuration file.
   ![editing a node](img/example-edit-node.png)
4. Click **Apply changes to cluster**.

#### Verification

1. View the created object on the page.
1. Optional: Click the name of the object to view its detailed summary.
   ![summary tab](img/summary-tab.png)
