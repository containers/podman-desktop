---
sidebar_position: 4
---

# Windows
## 1. Installing Podman Desktop on Windows

In order to install the latest Podman Desktop application for Windows, visit the [Downloads](/downloads/windows) section of this website to download the .exe file.

Simply download the file from the [Downloads](/downloads/windows) section and open it in your Desktop to install Podman Desktop.

## 2. Installing Podman (if not already present)

If you don't have Podman installed in your Windows computer, Podman Desktop will prompt you to do so as soon as you open the application. With the latest update, Podman Desktop will be able to install and configure Podman once you click on the 'Install' button on the home page.

NOTE: Podman Engine on Windows is backed by a virtualized Windows Subsystem for Linux (WSLv2) instance. If you don't have it installed already, Podman Desktop will prompt you to do so when you initialize a Podman Machine for the first time. You can read more about installing Podman on Windows [here](https://github.com/containers/podman/blob/main/docs/tutorials/podman-for-windows.md).

![img1](img/homescreen.png)

## 3. Initialize & Start the Podman Machine

### a. Default Configurations

Once Podman is installed, you will see a toggle button at "Home" window that will allow you to initialize a Podman Machine with default configurations. Simply activate the toggle to proceed.

![img2](img/initialize.png)

If this is your first time initializing Podman Machine after installation and you do not have WSLv2 installed, Podman Desktop will prompt you to do so (as shown in image below). Click 'OK' and wait for the process to complete. 

![img3](img/wsl_before_reboot_1.png)

Your device will reboot during the process. You will be again prompted to proceed.

![img4](img/wsl_before_reboot_2.png)

 After reboot, the remaining installation process will be performed. Once WSLv2 is installed, you will find that the Podman Machine is initialized.

![img5](img/wsl_after_reboot.png)

After initializing a Podman Machine, you should see a toggle to Run Podman. This will start the Podman Machine upon activation.

![img6](img/starting.png)

### b. Custom Configurations

In order to initialize a Podman Machine with custom configurations, go to "Preferences" on the menu present in the left-side of the application. Under Resources, you will find Podman. Clicking on it shall load the configuration settings for the machine. Enter the values that deem fit for your purpose and click on the "Create" button.

![img7](img/create.png)

Once the machine is created, you can click on the Start button in the Machine Settings to start the Machine.

![img8](img/machine.png)

### c. Command Line

Using the following two commands in the command line, you can initialize and start a Podman Machine the classic way!

To initialize the machine, the command is

```sh
podman machine init
```

After which, you can start the machine with the command

```sh
podman machine start
```

**Well that's just it. You shall now be all set to use Podman Desktop on Windows!**

