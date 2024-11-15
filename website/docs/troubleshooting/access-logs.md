---
sidebar_position: 10
title: Access logs 
description: Access Podman Desktop logs to troubleshoot
keywords: [podman desktop, podman, access logs, troubleshoot]
tags: [acessing-podman-desktop-logs, troubleshooting-podman-desktop]
---

# Access Podman Desktop logs 

When you face any connection issues or any other problems with your task execution, you can access the Podman Desktop logs to troubleshoot. In addition, you can also resolve those issues using the **Repair & Connections** and **Stores** tabs.

Stores denote the front-end objects that capture the event logs from the back-end side. For example, if a container is missing from the **Containers** component page, you can click the **containers** store link to check the event that triggered the last refresh. You can map the number of containers present in the store with the ones present on the **Containers** page. This way you can identify whether a recent event is captured. If not, use the **Refresh** button to refresh the store data.  

If you do not want to track the previous event logs, you can remove them from the history of the store.

#### Procedure: Access and save logs

1. Click the **Troubleshooting** icon in the status bar.
1. Select the **Logs** tab to view the logs.
    ![accessing logs](img/access-logs.png)
1. Optional: Select the **Gather Logs** tab to save all the logs into a .zip file.
    1. Click **collect and save logs as .zip**.
    1. Browse the location where you want to save the logs.
    1. Click **Save**. You get a successful operation notification.

#### Procedure: Resolve connection issues

1. Click the **Troubleshooting** icon in the status bar.
1. Optional: Click **Cleanup/Purge data** to delete all resources from the engine.
    ![Repair & Connections tab](img/repair-and-connections-tab.png)
1. Optional: Check container connections:
    1. Click **Ping** to view the response time of the container engine.
    1. Click **Check containers** to view the response time of the available containers.
1. Optional: Click **Reconnect Providers** to reconnect to the container engine socket.


#### Procedure: Resolve event-related issues

1. Click the **Troubleshooting** icon in the status bar.
1. Select the **Stores** tab to view the stores associated with Podman Desktop.
    ![store tab](img/stores-tab.png)
1. Click a store link.
1. Click **Refresh** to refresh the event logs.
    ![refresh the event logs](img/refresh-event-logs.png)
1. Optional: Click **Clear** to delete the event logs.
1. Click **OK**.