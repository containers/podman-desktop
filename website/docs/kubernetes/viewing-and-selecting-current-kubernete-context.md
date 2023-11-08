---
sidebar_position: 2
title: Selecting a context
description: Viewing and selecting the current Kubernetes context
keywords: [podman desktop, podman, containers, pods, migrating, kubernetes]
tags: [migrating-to-kubernetes]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Viewing and selecting the current Kubernetes context

With Podman Desktop, you can view and select your current Kubernetes context.

#### Prerequisites

- You have a Kubernetes context in your kubeconfig file: _&lt;your_kubernetes_cluster&gt;_.
  For example, [Creating a kind cluster](/docs/kind/creating-a-kind-cluster).

#### Procedure

1. Open the **Podman Desktop tray** menu.

   <Tabs groupId="operating-systems">
   <TabItem value="win" label="Windows">

   In the task bar, click **Show hidden icons**.

   ![Podman Desktop tray](img/tray-icon-on-windows-10.png)

   Right-click the **Podman Desktop tray** icon to open the menu.

   ![Podman Desktop tray](img/tray-main-menu-on-windows-10.png)

   </TabItem>
   <TabItem value="mac" label="macOS">

   ![Podman Desktop tray](img/tray-main-menu-on-macos.png)

   </TabItem>
   <TabItem value="linux" label="Linux">

   ![Podman Desktop tray](img/tray-main-menu-on-linux.png)

   </TabItem>

   </Tabs>

1. Click **Kubernetes** to see your current Kubernetes context.

   <Tabs groupId="operating-systems">
   <TabItem value="win" label="Windows">

   ![Podman Desktop tray](img/tray-kubernetes-on-windows-10.png)

   </TabItem>
   <TabItem value="mac" label="macOS">

   ![Podman Desktop tray](img/tray-kubernetes-on-macos.png)

   </TabItem>
   <TabItem value="linux" label="Linux">

   ![Podman Desktop tray](img/tray-kubernetes-on-linux.png)

   </TabItem>

   </Tabs>

1. (Optionally) To change your Kubernetes context, click on the context name to activate.
