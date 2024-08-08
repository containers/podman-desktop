---
sidebar_position: 2
title: Restricted environments
description: Using Podman Desktop behind a proxy requiring custom Certificate Authorities (CA).
tags: [podman-desktop, installing, windows, macos, linux]
keywords: [podman desktop, containers, podman, installing, installation, windows, macos, linux]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installing in a restricted environment

In a restricted environment you might face the following challenges:

- The default Podman Desktop and Podman installation methods download assets during the setup.

  However, a network restricted environment might refuse access to these external resources.

  Consider rather using the restricted environment installation method.

- The Podman Machine receives a network address distinct to your computer network address.

  When you are using a VPN, you might have problems to access, from your host, resources that the Podman Machine exposes.

  Consider enabling the **User mode networking** option when creating your Podman Machine to route the network traffic through your host.

- The Podman Machine connects directly to the external network.

  However, a restricted environment might block all traffic no going to a proxy.

  Consider configuring Podman Desktop and your Podman Machine to route the traffic through a proxy.

This tutorial is guiding you through the required steps to work in a restricted environment.

## Installing Podman Desktop and Podman

<Tabs groupId="operating-systems">
<TabItem value="win" label="Windows">

1. Check that your environment has:

   - 6 GB RAM for the Podman Machine.
   - Windows Subsystem for Linux version 2 (WSL 2) prerequisites. See [Enabling WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install), [WSL basic commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands), and [Troubleshooting WSL 2](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting#error-0x80370102-the-virtual-machine-could-not-be-started-because-a-required-feature-is-not-installed):
     - The Windows user has administrator privileges.
     - Windows 64bit.
     - Windows 10 Build 19043 or greater, or Windows 11.
     - On a virtual machine: [Nested Virtualization enabled](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/user-guide/nested-virtualization#configure-nested-virtualization).

1. Prepare your system.

   Enable the WSL feature, without installing the default Ubuntu distribution of Linux.

   Open the Command Prompt, and run:.

   ```shell-session
   > wsl --install --no-distribution
   ```

1. Restart your computer.

1. Download the _Installer for restricted environments_ from to the [Windows downloads page](/downloads/windows).

   It has all artifacts required to install Podman Desktop and Podman, and does not require Internet access to download resources during installation.
   However, it does not contain additional utilities, such as Compose or Kind.

1. Copy the downloaded file to the Windows host in a restricted environment, and run it.

1. The **Dashboard** screen displays: _<Icon icon="fa-solid fa-info" size="lg" /> Podman needs to be set up_.

   ![Podman needs set up screen](img/dashboard-podman-needs-set-up.png)

   Click the **Set up** button.

   Review and validate all confirmation screens to set up the Podman Machine.

   <details>
   <summary>

   Optionally, when you are using a VPN, consider enabling user mode networking:

   </summary>
   <div>

   - When you are using a VPN, you might have problems to access, from your host, resources that the Podman Machine exposes.

     To enable access from your host to resources on your Podman Machine, in the **Create Podman machine** screen, enable the **User mode networking (traffic relayed by a user process)** option.

   </div>
   </details>

</TabItem>
<TabItem value="mac" label="macOS">

1. Download the _Disk Image for restricted environments_ from the [macOS downloads page](/downloads/macos).

   It has all artifacts required to install Podman Desktop and Podman, and does not require Internet access to download resources during installation.
   However, it does not contain additional utilities, such as Compose or Kind.

1. Copy the downloaded file to the macOS host in a restricted environment, and double-click it.

1. Drag the Podman Desktop icon to the Applications folder.

1. The **Dashboard** screen displays: _<Icon icon="fa-solid fa-info" size="lg" /> Podman needs to be set up_.

   ![Podman needs set up screen](img/dashboard-podman-needs-set-up.png)

   Click the **Set up** button.

   Review and validate all confirmation screens to set up the Podman Machine.

   :::tip

   To route the network traffic through your VPN, in the **Create Podman machine** screen, enable the **User mode networking (traffic relayed by a user process)** option.

   :::

</TabItem>
<TabItem value="linux" label="Linux">

1. The Podman Destkop archive for restricted environments does not contain Podman CLI.

   To install Podman, go to [the Podman website](https://podman.io/), and follow the installation instructions.

1. Download the _AMD64 binary (tar.gz)_ archive from [the Linux Downloads page](https://podman-desktop.io/downloads/linux).

   It has all artifacts required to install Podman Desktop, and does not require Internet access to download resources during installation.
   However, it does not contain additional utilities, such as Podman CLI, Compose or Kind.

1. Copy the downloaded file to the Linux host in a restricted environment, and extract the archive content.

1. In the extracted directory, open the `podman-desktop` executable file.

</TabItem>
</Tabs>

#### Verification

- In the **Dashboard**, the **Podman** tile displays _Podman is running_.

  ![Podman is running screen](img/dashboard-podman-is-running.png)

## Using a proxy

Requirements:

- `<your.proxy.tld:port>`: Your proxy URL.
- Optionally: your proxy Certificate Authorities (CA) in Privacy-Enhanced Mail (PEM) format.

<Tabs groupId="operating-systems">
<TabItem value="win" label="Windows">

1. To enable proxy settings, go to **Settings > Proxy**, toggle on **Proxy configuration enabled**, set your proxy URL, and validate.

   ![Proxy settings](img/proxy-settings.png)

   <details>
   <summary>

   Optionally, to use a proxy requiring a custom Certificate Authorities:

   </summary>
   <div>

   1. Store your proxy Certificate Authorities (CA), in Privacy-Enhanced Mail (PEM) format, in the `proxy_ca.pem` file.

   2. Copy the certificate to the Podman machine:

      ```shell-session
      $ cat proxy_ca.pem | podman machine ssh podman-machine-default "cat > proxy_ca.pem"
      ```

   3. Open a shell prompt on the Podman machine:

      ```shell-session
      $ podman machine ssh
      ```

   4. Add the custom Certificate Authorities (CA) for your proxy:

      ```shell-session
      $ sudo cp <proxy_ca.pem> /etc/pki/ca-trust/source/anchors/
      $ sudo update-ca-trust
      ```

   </div>
   </details>

   <details>
   <summary>

   Optionally, to use a proxy in your containers:

   </summary>
   <div>

   1. Open a shell prompt on the Podman machine:

      ```shell-session
      $ podman machine ssh
      ```

   2. Edit the `containers.conf` file to pass the proxy environment variables to Podman CLI.

      The file location depends on your connection mode:

      - `rootless`: `$HOME/.config/containers/containers.conf`

      - `rootful`: `/etc/containers/containers.conf`

   3. Set the proxy environment variables to pass into the containers:

      ```toml
      [containers]
      http_proxy = true
      env = ["http_proxy=<your.proxy.tld:port>", "https_proxy=<your.proxy.tld:port>"]
      ```

   </div>
   </details>

2. Go to **Settings > Resources** and restart the Podman machine.

</TabItem>
<TabItem value="mac" label="macOS">

1. To enable proxy settings, go to **Settings > Proxy**, toggle on **Proxy configuration enabled**, set your proxy URL, and validate.

   ![Proxy settings](img/proxy-settings.png)

   <details>
   <summary>

   Optionally, to use a proxy requiring a custom Certificate Authorities:

   </summary>
   <div>

   1. Store your proxy Certificate Authorities (CA) in Privacy-Enhanced Mail (PEM) format, in your home directory, in the `proxy_ca.pem` file.

   2. Copy the certificate to the Podman machine:

      ```shell-session
      $ cat proxy_ca.pem | podman machine ssh podman-machine-default "cat > proxy_ca.pem"
      ```

   3. Open a shell prompt on the Podman machine:

      ```shell-session
      $ podman machine ssh
      ```

   4. Add the custom Certificate Authorities (CA) for your proxy:

      ```shell-session
      $ sudo cp <proxy_ca.pem> /etc/pki/ca-trust/source/anchors/
      $ sudo update-ca-trust
      ```

   </div>
   </details>

   <details>
   <summary>

   Optionally, to use a proxy in your containers:

   </summary>
   <div>

   1. Open a shell prompt on the Podman machine:

      ```shell-session
      $ podman machine ssh
      ```

   2. Edit the `containers.conf` file to pass the proxy environment variables to Podman CLI.

      The file location depends on your connection mode:

      - `rootless`: `$HOME/.config/containers/containers.conf`

      - `rootful`: `/etc/containers/containers.conf`

   3. Set the proxy environment variables to pass into the containers:

      ```toml
      [containers]
      http_proxy = true
      env = ["http_proxy=<your.proxy.tld:port>", "https_proxy=<your.proxy.tld:port>"]
      ```

   </div>
   </details>

2. Go to **Settings > Resources** and restart the Podman machine.

</TabItem>
<TabItem value="linux" label="Linux">

On Linux, Podman Desktop **Proxy** settings have no effect on Podman.

Configure Podman.

1. Edit the `containers.conf` file to pass the proxy environment variables to Podman CLI.

   The file location depends on your connection mode:

   - `rootless`: `$HOME/.config/containers/containers.conf`

   - `rootful`: `/etc/containers/containers.conf`

1. Set the proxy environment variables to pass into the Podman engine:

   ```toml
   [engine]
   env = ["http_proxy=<your.proxy.tld:port>", "https_proxy=<your.proxy.tld:port>"]
   ```

1. Add the custom Certificate Authorities (CA) for your proxy:

   ```shell-session
   $ sudo cp <proxy_ca.pem> /etc/pki/ca-trust/source/anchors/
   $ sudo update-ca-trust
   ```

1. Restart all `podman` processes.

   ```shell-session
   $ pkill podman
   ```

</TabItem>
</Tabs>

#### Verification

1. Podman can pull images.

   1. Go to **Images**.
   1. Click **Pull an image**.
   1. **Image to Pull**: Enter an image name, such as `quay.io/podman/hello`.
   1. Click **Pull image**.
   1. Podman Desktop reports `Download complete`.

1. You can install extensions such as:

   - [Installing Compose](/docs/compose/setting-up-compose)
   - [Installing Kind](/docs/kind/installing).
