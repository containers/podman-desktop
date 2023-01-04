---
sidebar_position: 5
---

# Linux

Check out the [Downloads](/downloads/linux) section of this website to download either the [.flatpak](https://flatpak.org/setup/Fedora) file or the zip file depending on your preference.

To use Podman Desktop, the latest version of Podman is required. Podman is a rootless, daemonless container engine. Read more about it [here](https://podman.io/whatis.html).

## Installing Podman Desktop

### 1. Using [FlatHub](https://flathub.org/apps/details/io.podman_desktop.PodmanDesktop)

With FlatHub, you can install Podman Desktop with just a single command.

> Follow the [setup guide](https://flatpak.org/setup/) before installing Podman Desktop

```sh
flatpak install --user flathub io.podman_desktop.PodmanDesktop
```
After installation, to open Podman Desktop, use the following command:

```sh
flatpak run io.podman_desktop.PodmanDesktop
```

### 2. Using [Flatpak](https://flatpak.org/setup/) application from [Downloads](/downloads/linux)

:::infoPrerequisite 
Verify Flatpak is set up in your distribution. Click [here](https://flatpak.org/setup/) to learn more about setting up Flatpak.
:::

Open the Terminal and go to Downloads directory. 

```sh
cd Downloads
```

> The Flatpak identifier for the application is `io.podman_desktop.PodmanDesktop`. This is required to install & start the application using Flatpak.

Run the following command to install the Flatpak application,

```sh
flatpak install io.podman_desktop.PodmanDesktop
```

Run the following command to start the application,

```sh
flatpak run io.podman_desktop.PodmanDesktop
```

You can read more about running Flatpak applications [here](https://docs.flatpak.org/en/latest/using-flatpak.html).

### 3. Using zip file

Download the zip file and extract the folder.

Navigate within the folder and double-click on the `podman-desktop` executable file. This should start the application for you.

## Next Steps

Learn more on how to get started with Podman Desktop by clicking [here](/docs/getting-started/getting-started).
