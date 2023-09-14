---
sidebar_position: 2
title: Installing silently
description: Installing Podman Desktop silently on Windows with the installer
tags: [podman-desktop, installing, windows]
keywords: [podman desktop, containers, podman, installing, installation, windows]
---

# Installing Podman Desktop silently with the Windows installer

Consider using this method to install the Podman Desktop Windows installer without user interaction.

#### Procedure

1. [Download the Windows installer](/downloads/windows).
2. Run the PowerShell command:

   ```ps
   Start-Process -FilePath '.\podman-desktop-0.10.0-setup.exe' -ArgumentList "\S" -Wait
   ```

#### Next steps

- [Installing Podman](installing-podman-with-podman-desktop)
- [Getting Started with Podman Desktop](/docs/getting-started)
