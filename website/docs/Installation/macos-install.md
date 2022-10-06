---
sidebar_position: 3
---

# MacOS

This page contains information regarding installation of Podman Desktop on MacOS. 

You can install Podman Desktop on Mac:

<ol>
<li>1. Using the .dmg file</li> 
<li>2. Using Brew</li>
</ol>
<br/>

:::infoPrerequisite
Podman Desktop requires [Podman Engine](https://docs.podman.io/en/latest/index.html). If you don't have Podman Engine installed, Podman Desktop will prompt you to do so at a later stage.
:::

## Installing Podman Desktop on MacOS using .dmg file

**1. Download the `.dmg` file from the [Downloads](/downloads/macos) section of this website.**

While we recommend getting the "universal" binary file which will work irrespective of the chip architecture your Mac possesses, you also have the option to get the applicable .dmg file depending on your Mac Hardware Architecture (i.e. Intel or Apple M1).

**2. Locate the downloaded file and and double-click on it. (Usually, you will find the downloaded file in the Downloads folder)**

<!-- > ![img0](img/download-dmg.png) -->
<img src="/assets/images/download-dmg-a847cf16a9f16dfddba0e46a4dbb3c2b.png" alt="img0" height="400px" width="550px"/> <br/>

**3. Drag Podman Desktop icon to the Applications folder.**

<!-- > ![img1](img/click-and-drag.png) -->
<img src="/assets/images/click-and-drag-862777e1ab1bfcafc559dd59f71a77e8.png" alt="img1" height="200px" width="350px"/> <br/>

**4. Start Podman Desktop from the 'Launchpad' or Mac's `Applications` directory.**

<!-- > ![img2](img/podman-desktop-app.png) -->
<img src="/assets/images/podman-desktop-app-9ea27077f1d767753acfb5c574657f27.png" alt="img2" height="200px" width="350px"/> <br/>

**5. Install Podman from Podman Desktop, if not yet installed.** 

When you open Podman Desktop for the first time, click on the "View detection checks" button to scan if all the prerequisites to use Podman Desktop are met. If it says `❌ podman cli was not found in the PATH`, then you need to install the Podman CLI/Engine which can be done within the application. 

<!-- ![img3](img/pd-before-podman.png) -->
<img src="/assets/images/pd-before-podman-22ea6273dc67b3521d8836ce6fa717ec.png" alt="img3" height="450px" width="700px"/> <br/>

Click on the "Install" button next to the "View detection checks" button, and follow the instructions on screen. 
You will be redirected to the Podman Installer. Follow the instructions on screen and enter your system password when asked.

<!-- ![img4](img/system-pass.png) -->
<img src="/assets/images/system-pass-563b1bc0979f040e796c2e2eec40f11b.png" alt="img4" height="250px" width="400px"/> <br/>

After installation is complete, close the installer. Podman Engine has been installed and you are now ready to use Podman Desktop.

## Installing Podman Desktop on MacOS using [brew](https://brew.sh/).

:::infoPrerequisite
- [Homebrew](https://brew.sh/)
:::

### Installation steps

<ol>
<li>1. Open a terminal on your Mac.</li>
<li>2. Run the command mentioned below.</li>  
</ol>

```sh
brew install podman-desktop
```

<br/>

Brew will also install the Podman Engine along with the Podman Desktop application, in case you don't have it installed yet. 

After the command is executed, you can find the Podman Desktop Application within the `Applications` directory of the MacOS.

## Getting Started

Learn more on how to get started with Podman Desktop by clicking [here](/docs/getting-started/getting-started).


