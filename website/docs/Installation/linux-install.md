---
sidebar_position: 5
---

# Linux

## Installing Podman Engine

In order to use Podman Desktop, you need to have a 4.x version of Podman Engine. For example Fedora 36 comes with Podman Engine 4.x. All you need to do is make sure that the linux distribution is using a 4.x version 

For other Linux Distributions, click [here](https://podman.io/getting-started/installation#installing-on-linux) for a guide to install Podman Engine for different linux Distributions.

Now that you have Podman machine up and running, you can check out the [Downloads](/downloads/linux) section of this website to download either the [.flatpak](https://flatpak.org/setup/Fedora) file or the zip file depending on your preference.

## Installing Podman Desktop

### 1. Using [flatpak](https://flatpak.org/setup/)

Before you follow along, make sure flatpak is set up in your distribution. Click [here](https://flatpak.org/setup/) to learn more about setting up flatpak.

Open the Terminal and go to Downloads directory. 

```sh
cd Downloads
```

Run the following command to install the flatpak application,

```sh
flatpak install <name_of_the_flatpak_file> 
```

In order to start the application, you need to know the Flatpak identifier for the application. In our case, that is ```com.github.containers.desktop```

Run the following command to start the application,

```sh
flatpak run com.github.containers.desktop
```

You can read more about running Flatpak applications [here](https://docs.flatpak.org/en/latest/using-flatpak.html).

### 2. Using zip file

Download the zip file and extract the folder.

Navigate within the folder and double-click on the ```podman-desktop``` executable file. This should start the application for you.