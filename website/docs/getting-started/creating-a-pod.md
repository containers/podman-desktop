---
sidebar_position: 10
title: Creating a pod
description: Creating a pod from containers.
keywords: [podman desktop, podman, containers, pods]
tags: [pods]
---

# Creating a pod from containers

With Podman Desktop, you can create a pod from your containers, and run it on the Podman container engine.


#### Prerequisites

* You are using the Podman container engine.
* Your containers, running or stopped, are available on the **Containers** page. For example: *<your_frontend_container>* and *<your_backend_container>*.

#### Procedure

1. Open **Podman Desktop dashboard > Containers**.
1. Click the checkboxes to select your containers.
1. Click <icon icon="fa-solid fa-cubes" size="lg" /> to create a pod with the selected containers.
1. On the **Copy containers to a pod** screen
   1. **Name of the pod**: edit the pod name *`<my_pod>`*.
   1. Click the **<icon icon="fa-solid fa-cubes" size="lg" /> Create pod using these containers** button.

#### Verification

1. Open **Pods**
1. Your pod *`<my_pod>`* is in the list. 
