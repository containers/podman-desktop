---
sidebar_position: 5
title: Interacting with a database server
description: Interacting with databases from the Podman Desktop application
keywords: [podman desktop, podman, databases]
tags: [podman-desktop, interacting-with-databases]
---

# Interacting with a database server

This tutorial covers the following end-to-end tasks required to interact with a database server from within the Podman Desktop UI:

- Pulling a SQL server image
- Creating a SQL server instance
- Accessing the instance from terminal

For creating a database instance, you can use one of the following options:

- [Build a MySQL server image using a container or docker file](/docs/containers/images/building-an-image)
- [Import a MySQL server image from your local machine](/tutorial/managing-your-application-resources#managing-images) using the **Import** button on the _Images_ component page
- Pull a MySQL server image from a registry (covered in this tutorial)

This tutorial focuses on creating a MySQL server instance by pulling a MySQL server image from the _quay.io_ registry.

## Before you begin

Make sure you have:

- [Installed Podman Desktop application](/docs/installation).
- [A running Podman machine](/docs/podman/creating-a-podman-machine).
- [Configured the _quay.io_ registry](/docs/containers/registries) to pull a MySQL Server image, such as `quay.io/fedora/mysql-80`.
- A developer role.

## Pulling a MySQL server image

1. Click **Images** in the left navigation pane.
1. Click the **Pull** button.
   ![pulling an image](img/pull-button.png)
1. Enter the name of the image to pull from the registry.
1. Click **Pull image**. A download complete notification opens.
   ![clicking the pull button](img/click-pull-image.png)
1. Click **Done**.
   ![image pulled successfully](img/image-successfully-pulled.png)
1. View the newly created `quay.io/fedora/mysql-80` image on the same page.
   ![image added on the page](img/new-image-added.png)

## Creating a MySQL server instance

1. Click **Images** in the left navigation pane.
1. Click the **Run Image** icon corresponding to the MySQL server image you want to run.
   ![running an image](img/run-image-icon.png)
1. Configure the basic details, such as container name, port mapping, and environment variables for the MySQL server instance.
1. Click **Start Container**.
   ![starting a container](img/starting-a-mysql-container.png)
1. View the successful operation notification in the _Tty_ tab of the _Container Details_ page.
   ![sql server started](img/my-sql-server-started.png)
1. Click the **close** icon on the right hand side of the page.
1. View the newly created MySQL server container on the _Containers_ page.
   ![database container created](img/database-container-created.png)

## Accessing the instance from terminal

1. Click **Containers** in the left navigation pane.
1. Click the created `mysql-database` container. The _Container Details_ page opens.
   ![database container](img/database-container-created.png)

1. Select the **Terminal** tab.
1. Run the `mysql -uroot` command to connect to the database server as an administrator. The prompt changes to `mysql>`.
   ![connect to the SQL server instance as DBA](img/connect-to-sql-as-dba.png)
1. Interact with the database server by running any mysql commands, such as `SHOW DATABASES;`:
   ![interact with the database](img/interacted-with-database.png)
