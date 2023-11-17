---
sidebar_position: 50
title: Setting Podman machine default connection
description: How to set Podman machine default connection.
---

# Setting Podman machine default connection

Each Podman machine exposes two connections:

- rootless
- rootful

Podman has one default connection.

Podman Desktop, and other tools, such as Kind, connect to the default connection.

After an event that might have changed the default Podman machine connection, such as creating another Podman machine, consider verifying and setting the default connection.

#### Procedure

1. List Podman machine connections, in a terminal:

   ```shell-session
   $ podman system connection ls
   ```

1. Set the Podman machine default connection to your desired connection, such as `podman-machine-default-root`, in a terminal:

   ```shell-session
   $ podman system connection default podman-machine-default-root
   ```

1. List Podman machine connections, to verify which is the default, in a terminal:

   ```shell-session
   $ podman system connection ls
   ```

1. Restart the Podman machine that has the default connection:

   ```shell-session
   $ podman machine stop
   $ podman machine start
   ```

1. Refresh Podman Desktop connection to Podman: click the **<Icon icon="fa-solid fa-lightbulb" size="lg" />** icon to open the **Troubleshooting** page, and click the **Reconnect providers** button.

#### Verification

- Podman Desktop lists images, containers, and pods that are accessible via the desired Podman machine connection.
