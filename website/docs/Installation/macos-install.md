---
sidebar_position: 3
---

# MacOS
## Installing Podman Desktop on MacOS using .dmg file

If you already have a Podman machine up and running, you can check out the [Downloads](/downloads/macos) section of this website to get the applicable .dmg file depending on your Mac Hardware Architecture (i.e. Intel or Apple M1).

If you are new to Podman and do not have a Podman Machine up and running, fret not. Downloading and Installing Podman Desktop allows you to get all the dependencies as well.

Simply download the file from the [Downloads](/downloads/macos) section and open it in your machine to install Podman Desktop.

Once you open it, the system will prompt you to drag the icon to the Applications folder.

![img1](img/click-and-drag.png)

After which, you are just a click away from using Podman Desktop.

If you already have Podman installed, you are ready to build images and run containers. Learn more on how to get started with Podman Desktop by clicking [here](/docs/getting-started/getting-started).

If the system does not have Podman installed, you will be prompted as follows.

![img2](img/pd-before-podman.png)

You can click on the "Install" button and follow the instructions on screen. You will be redirected to the Podman Installer. Follow the instructions on screen and enter your system password when asked.

![img3](img/system-pass.png)

After installation is complete, close the Installer and you are all set to build images and run containers using Podman Desktop.

## Installing Podman Desktop on MacOS using [brew](https://brew.sh/).

The following command will help you install Podman Desktop on your Mac through [Homebrew](https://brew.sh/). So make sure you have that installed and set up. 

To install Podman Desktop, simply run the command below:

```sh
brew install podman-desktop
```

After the command is executed, you can find the Podman Desktop Application within the Applications directory of the MacOS.
