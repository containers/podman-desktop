---
title: OpenShift Local
description: Creating an OpenShift Local instance
keywords: [podman desktop, podman, containers, pods, migrating, kubernetes, openshift]
tags: [migrating-to-kubernetes, openshift]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Creating an OpenShift Local instance

[Red Hat OpenShift Local](https://developers.redhat.com/products/openshift-local/overview) manages a minimal OpenShift or MicroShift cluster on your workstation for local development and testing.

With Podman Desktop and the OpenShift Local extension, you can manage your OpenShift Local instances.

#### Prerequisites

- [Register a Red Hat account](https://developers.redhat.com/register).

#### Procedure

1. Install the _OpenShift Local_ extension: on to **Dashboard**, click **OpenShift Local <Icon icon="fa-solid fa-download" size="lg" />**.
1. Install the OpenShift Local binaries, when on the **Dashboard**, you see _Podman Desktop was not able to find an installation of OpenShift Local_.

   <Tabs groupId="operating-systems">
   <TabItem value="win" label="Windows">

   1. In the **OpenShift Local** tile, click **<Icon icon="fa-solid fa-rocket" size="lg" /> Install**.
   1. When prerequisites are missing, follow the instructions.
   1. In the **Red Hat OpenShift Local** screen, click **Yes** to start the installation.
   1. Follow the installation program instructions.
   1. Reboot to finalize system changes.

   </TabItem>
   <TabItem value="mac" label="macOS">

   1. In the **OpenShift Local** tile, click **<Icon icon="fa-solid fa-rocket" size="lg" /> Install**.
   1. When prerequisites are missing, follow the instructions.
   1. In the **Red Hat OpenShift Local** screen, click **Yes** to start the installation.
   1. Follow the installation program instructions.
   1. Reboot to finalize system changes.

   </TabItem>
   <TabItem value="linux" label="Linux">

   1. Go to the [Red Hat OpenShift local download page](https://console.redhat.com/openshift/create/local).
   1. Select your platform.
   1. Click **Download OpenShift Local**.
   1. Extract the archive.
   1. Copy the `crc` binary to a directory in your`$PATH`, such as `/usr/local/bin`.
   1. To configure your system, run the command:

      ```shell-session
      $ crc setup
      ```

   1. Exit and restart Podman Desktop.

   </TabItem>
   </Tabs>

1. (Optionally) Review the extension settings in **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Preferences > Extension: Red Hat OpenShift Local**.
1. On the **Dashboard**, click **Initialize and start**.

   1. Select your OpenShift Local Virtual machine preset, if not set in **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Preferences > Extension: Red Hat OpenShift Local > Preset**.
      - _MicroShift_ (experimental): provides a lightweight and optimized environment with a limited set of services.
      - _OpenShift_: provides a single node OpenShift cluster with a fuller set of services, including a web console (requires more resources).
   2. Provide a pull secret, required to pull container images from the registry:

      1. Open the [Red Hat OpenShift Local download page](https://cloud.redhat.com/openshift/create/local).
      1. Click **Copy pull secret**.
      1. Get back to Podman Desktop.
      1. Paste the pull secret, and press `Enter`.

#### Verification

1. On the **Dashboard** screen, _OpenShift Local is running_.
1. On the **<Icon icon="fa-solid fa-cog" size="lg" />Settings > Resources** screen, your OpenShift Local instance is running.

   ![Developer Sandbox is running](img/resources-openshift-local-running.png)

1. [Select your OpenShift Local instance the Podman Desktop tray](/docs/kubernetes/viewing-and-selecting-current-kubernetes-context).
1. Run basic tasks such as:
   - [Deploying a container](/docs/kubernetes/deploying-a-container-to-kubernetes)
   - [Deploying a pod](/docs/kubernetes/deploying-a-pod-to-kubernetes)

#### Additional resources

- [Red Hat OpenShift Local extension repository](https://github.com/crc-org/crc-extension)
