---
title: Using RHEL as a WSL podman machine
description: Build image and use it directly in your kubernetes cluster
slug: sharing-podman-images-with-kubernetes-cluster
authors: [jeffmaury]
tags: [podman-desktop, podman, rhel, wsl, machine]
hide_table_of_contents: false
---

Red Hat provides a tool called image builder that allows developers to build their own custom image of RHEL in a variety of format. Recently, image builder added WSL as a target so you can run RHEL on Windows as a WSL distribution.

This [article](https://developers.redhat.com/articles/2023/11/15/create-customized-rhel-images-wsl-environment) details the steps and actions required to build and run your RHEL WSL image.

The purpose of this article is to describe the options needed for the RHEL WSL distribution so that is can be used as a Podman machine.

# Requirements

In order to be used as a Podman machine, we need to ensure that the following packages are installed in the RHEL WSL images:

- podman
- podman-docker
- procps-ng
- openssh-server
- net-tools
- iproute
- dhcp-client
- sudo
- systemd-networkd

Luckily, all but the last package are available from the RHEL 8 repositories that are pre configured. The last package (systemd-networkd) is available from the EPEL 8 repository and will need to be configured when building the image.

# Build the image

Navigate to [image builder](https://console.redhat.com/insights/image-builder)

![image builder](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine1.png)

On the upper right menu, enable the **Preview** mode.

![image builder preview](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine2.png)

Click **Create image** to open the **Create image** dialog wizard.

![image wizard](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine3.png)

On the **Image output** page, select the following:

- From the **Release** list, select Red Hat Enterprise Linux (RHEL) 8.
- From the **Select target environments** option, select **WSL - Windows Subsystem for Linux (**`.tar.gz`**)**.
- Click **Next**.

On the **Register** page, select **Automatically register and enable advanced capabilities.**

- From the dropdown menu, choose an activation key to use for the image. See [Creating an activation key](https://access.redhat.com/documentation/en-us/subscription_central/2023/html/getting_started_with_activation_keys_on_the_hybrid_cloud_console/assembly-creating-managing-activation-keys#proc-creating-act-keys-console_).
- Click **Next**.

On the **File system configuration** page, select **Recommended: Use automatic partitioning**.

- Click **Next**.

On the **Content** page, complete the following steps to add additional packages to your image:

- On the Additional Red Hat packages step:

  - On the **Available packages** search field, enter podman and click the **→** button.
  - Select the podman package and click the **>** button to add the selected package shown in the package search results to the **Chosen packages** dual list box. Repeat the operation for the podman-docker package.
  - On the **Available packages** search field, enter procps-ng and click the **→** button.
  - Select the procps-ng package and click the **>** button to add the selected package shown in the package search results to the **Chosen packages** dual list box.
  - On the **Available packages** search field, enter openssh-server and click the **→** button.
  - Select the openssh-server package and click the **>** button to add the selected package shown in the package search results to the **Chosen packages** dual list box.
  - On the **Available packages** search field, enter net-tools and click the **→** button.
  - Select the net-tools package and click the **>** button to add the selected package shown in the package search results to the **Chosen packages** dual list box.
  - On the **Available packages** search field, enter iproute and click the **→** button.
  - Select the iproute package and click the **>** button to add the selected package shown in the package search results to the **Chosen packages** dual list box.
  - On the **Available packages** search field, enter dhcp-client and click the **→** button.
  - Select the dhcp-client package and click the **>** button to add the selected package shown in the package search results to the **Chosen packages** dual list box.
  - On the **Available packages** search field, enter sudo and click the **→** button.
  - Select the sudo package and click the **>** button to add the selected package shown in the package search results to the **Chosen packages** dual list box.
  - Click **Next**
    ![custom repositories](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine4.png)

Click on the [Create and manage repositories here](https://console.redhat.com/preview/settings/content) link. This will open a new tab

![custom repositories](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine5.png)

Click **Add repositories**

![add custom repository](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine6.png)

On the **Add custom repositories** page, select the following:

- In the **Name** list, enter EPEL 8.
- In the **URL** field, enter https://dl.fedoraproject.org/pub/epel/8/Everything/x86_64/
- In the **GPG key** field, enter https://dl.fedoraproject.org/pub/epel/RPM-GPG-KEY-EPEL-8
- Click **Save**.

![custom repository created](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine7.png)

Close the tab and switch back to the previous one

![select custom repository](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine8.png)

Click **Next**

On the **Content** page, complete the following steps to add additional packages to your image:

- On the Additional custom packages step:

  - On the **Available packages** search field, enter systemd and click the **→** button.
  - Select the systemd-networkd package and click the **>** button to add the selected package shown in the package search results to the **Chosen packages** dual list box.
  - Click **Next**

On the **Details** page,

- In the **Image Name** list, enter rhel-wsl.
- Click **Save**.

![images list](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine9.png)

The image is being built. Once build is finished, the download link is available. Click on the **Download (.tar.gz)** link and save the downloaded file to one of your local folder.

# Create the RHEL WSL podman machine

Launch Podman Desktop and go to the **Settings -> Resources** page:

![images list](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine10.png)

On the Podman provider, click on **Create new ...**

In the **Create Podman machine** page, select the **Browse** button for the **Image Path** field and select the file downloaded from image builder

![create podman machine](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine11.png)

Click on the **Create** button: the machine will be created and started. After a short time, the operation status should be reported.

![podman machine created](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine12.png)

# Let's play with the RHEL WSL podman machine

Go to the **Images** page and pull the **httpd** image

![pull httpd image](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine13.png)

Click on **Done**

![images list](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine14.png)

Start the image by clicking on the **Run image** icon

![images list](img/using-rhel-wsl-podman-machine\rhel-wsl-podman-machine15.png)

Once the container is started, the Apache server can be accessed on http://localhost:9000

# Troubleshooting

There is a known issue when the Podman machine is stopped: when the `podman machine stop` command is run, an error message is printed:

```
Error: stopping sysd: exit status 1
```

As the Podman machine is not fully stopped, it is recommended to shutdown WSL (`wsl --shutdown`) in order to properly cleanup state.
