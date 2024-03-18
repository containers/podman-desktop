---
sidebar_position: 2
title: Onboarding for containers
description: To run container workloads with Podman Desktop, set up at least one container engine.
tags: [podman-desktop, onboarding]
keywords: [podman desktop, containers, podman, onboarding]
---

# Onboarding for container workloads

To run container workloads, set up at least one container engine.

Podman Desktop does not automatically set up container engine resources that you might not need.

#### Procedure

1. Select a container engine supporting your workload.

   | Workload            | Podman | Native Docker | Docker Desktop |
   | :------------------ | :----: | :-----------: | :------------: |
   | Rootless containers | ✅ yes |    ✅ yes     |     ❌ no      |
   | Rootful containers  | ✅ yes |    ✅ yes     |     ✅ yes     |
   | Compose             | ✅ yes |    ✅ yes     |     ✅ yes     |
   | Pods                | ✅ yes |     ❌ no     |     ❌ no      |

   Podman supports rootless container and pods, in addition to rootful containers and Compose.

2. Select an execution environment supporting your container engine and your operating system.

   - Select a Podman execution environment:

     | Host operating system | Native containers | Podman Machine  |  Lima instance  |
     | :-------------------- | :---------------: | :-------------: | :-------------: |
     | Windows               |       ❌ no       |     ✅ yes      | ❌ experimental |
     | macOS                 |       ❌ no       |     ✅ yes      |     ✅ yes      |
     | Linux                 |      ✅ yes       | ❌ experimental |     ✅ yes      |

   - Select a Docker execution environment:

     | Host operating system | Native containers | Docker Desktop |  Lima instance  |
     | :-------------------- | :---------------: | :------------: | :-------------: |
     | Windows               |       ❌ no       |     ✅ yes     | ❌ experimental |
     | macOS                 |       ❌ no       |     ✅ yes     |     ✅ yes      |
     | Linux                 |      ✅ yes       |     ✅ yes     |     ✅ yes      |

3. Setup your container engine.

   - Podman Desktop assists you to set up Podman and Podman machines on Windows and macOS.

     - [Installing Podman](/docs/installation).
     - [Creating a Podman machine with Podman Desktop](/docs/podman/creating-a-podman-machine).

   - Podman Desktop consumes your native containers, Lima instance or Docker setup.

     - [Creating a Lima instance](/docs/lima/creating-a-lima-instance).
     - [Installing Podman on Linux](https://podman.io/docs/installation#installing-on-linux).
