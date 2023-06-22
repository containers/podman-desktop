---
sidebar_position: 10
title: Creating a pod
description: Selecting containers to run a a pod.
keywords: [podman desktop, podman, containers, pods]
tags: [pods]
---

# Selecting containers to run in a pod

With Podman Desktop and the Podman container engine, you can select containers to run them in a pod.

Consider running containers in a pod to:

1. Expose your `frontend` application to the public network.
2. Protect your `database` container in a private network.

#### Prerequisites

- You are using the Podman container engine.
- Your containers, such as `database` and `frontend`, running or stopped, are available on the Containers page.
- The `frontend` container is configured to access the service exposed by the `database` container on localhost, such as `localhost:6379`.

#### Procedure

1. Go to **<icon icon="fa-solid fa-cube" size="lg" /> Containers**.
1. Click the checkbox in the container line for your containers, such as `database` and `frontend`.
1. Click **<icon icon="fa-solid fa-cubes" size="lg" />**.
1. In the **Copy containers to a pod** screen:
   1. **Name of the pod**: enter your pod name, such as `my-pod`.
   1. **All selected ports will be exposed**:
      1. Select `frontend`.
      1. Clear `database`.
1. Click **<icon icon="fa-solid fa-cube" size="lg" /> Create Pod**.

#### Verification

1. Go to **<icon icon="fa-solid fa-cubes" size="lg" /> Pods**.
1. Click your pod, such as `my-pod`.
1. Go to **Logs**: see the combined logs from the two containers.
1. Go to **Summary**: see the containers.
1. Click `frontend-podified`.
1. Click **<icon icon="fa-solid fa-external-link" size="lg" />**.
1. Your browser opens the service exposed by your `frontend-podified` container.
1. Go to **<icon icon="fa-solid fa-cube" size="lg" /> Containers**: see the running containers.
