---
sidebar_position: 10
title: OpenShift cluster
description: Configuring access to an OpenShift cluster
keywords: [podman desktop, podman, containers, pods, migrating, kubernetes]
tags: [migrating-to-kubernetes]
---

# Configuring accessto an OpenShift cluster

With Podman Desktop, you can configure access to your OpenShift cluster.

#### Prerequisites

- You have credentials for your OpenShift cluster.

#### Procedure

1. Go to **OpenShift**.
1. Click **<icon icon="fa-solid fa-sign-in" size="lg" />** to login to an OpenShift cluster.
1. On the **Login to OpenShift** dialog:

   1. Set the Cluster URL
   1. (Optionally) When your cluster is using self-signed TLS certificates, set **Skip TLS Verify**.
   1. Set your authentication method:

      - _Credentials_: _`<Username>`_ and _`<Password>`_.
      - _Bearer Token_: _`<Your_token>`_

#### Verification

1. [Select your OpenShift instance the Podman Desktop tray](../viewing-and-selecting-current-kubernete-context).
1. Run basic tasks such as:
   - [Deploying a container](../deploying-a-container-to-kubernetes)
   - [Deploying a pod](../deploying-a-pod-to-kubernetes)
