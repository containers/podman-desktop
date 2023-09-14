---
sidebar_position: 2
title: Installing Podman Desktop
description: You can install Podman Desktop on Windows, macOS, and Linux.
tags: [podman-desktop, installing, windows, macos, linux]
keywords: [podman desktop, containers, podman, installing, installation, windows, macos, linux]
---

# Installing Podman Desktop

You can install Podman Desktop on:

- [Windows](./installation/windows-install)
- [macOS](./installation/macos-install)
- [Linux](./installation/linux-install)

## Understanding what you need for container workloads

Podman Desktop does not install any container engine automatically.

To run container workloads, Podman Desktop requires you to install at least one container engine: Podman or Docker.

[![](https://mermaid.ink/img/pako:eNptUcFOAyEQ_RUyZ_ZQNTHhZuyxNkYTD4bLuEx3yS7DBlhtbfrvUmh0NYYD7817b5gwR2i9IVDQNI3m1vPOdkqzEBF5oEOBmfT-4wXHmaISOxwj1TLn6N1oO3bESYlguz5pLp1qvHmjhJrrefTGIQuHbW-ZZKVy9SPJJ-_TSDGKPEfCbArxrF_UfC3p2bybxz_eb_neu8lHqjXNW0z2ncTG8rxfPP2rvPbtQKEmNtbhwlfoUq9YGIpD8tNCuqD_p7uIi9lAgqPg0Jq8g-P5WzWknhxpUBkaDIMGzafswzn55wO3oFKYScI8GUy0ttgFdKDKXiSQscmHh7rUslsJEzKoI-xBXd9KOIC6ulmdJHx6n3Oror8WXHqcvgDTMroa?type=png)](https://mermaid.live/edit#pako:eNptUcFOAyEQ_RUyZ_ZQNTHhZuyxNkYTD4bLuEx3yS7DBlhtbfrvUmh0NYYD7817b5gwR2i9IVDQNI3m1vPOdkqzEBF5oEOBmfT-4wXHmaISOxwj1TLn6N1oO3bESYlguz5pLp1qvHmjhJrrefTGIQuHbW-ZZKVy9SPJJ-_TSDGKPEfCbArxrF_UfC3p2bybxz_eb_neu8lHqjXNW0z2ncTG8rxfPP2rvPbtQKEmNtbhwlfoUq9YGIpD8tNCuqD_p7uIi9lAgqPg0Jq8g-P5WzWknhxpUBkaDIMGzafswzn55wO3oFKYScI8GUy0ttgFdKDKXiSQscmHh7rUslsJEzKoI-xBXd9KOIC6ulmdJHx6n3Oror8WXHqcvgDTMroa)

Podman can run:

- Rootless containers
- Pods
- Rootful containers
- Compose

Docker can run:

- Rootful containers
- Compose

Consider installing the Podman container engine also for:

- Added security
- No daemon
- Open source

Podman Desktop can use different virtual machines, such as:

- Lima
- Podman Machine

## Understanding what you need for Kubernetes workloads

Podman Desktop does not install any Kubernetes cluster automatically.

To run Kubernetes workloads, Podman Desktop requires you to:

- Connect to a remote Kubernetes cluster.
- Install a local Kubernetes cluster.

[![](https://mermaid.ink/img/pako:eNp1Uk1rwzAM_StGZ2c0KynMt7EeBm0ZrDDY8EWN1cQ0kYvjsHal_32OwwZd15Of9J4e-vAJSmcIFGRZprl0vLWV0ixEh7yjY4IxqN3nGzY9dUpsseloTHMsfWxsxS1xUMLbqg6ak9NYnm0ooGbNT44DWiYviKv4yoVlI_N_iJVlu-s3NJCal7ZFuZh2Mhc_QeQ8U6BuVLySEc8YxMueeF3bbRBLV2ITfUrvUmLQ3VL9xrfM1shm4w5_he-u92JoU4wru-Sv2MtmrujLma7pYX6Q0JJv0Zp4rNOwfw2hppY0qAgN-p0Gzeeowz649ZFLUMH3JKHfGww0t1h5bEGlA0ogY4Pzq_H66RNI2CODOsEB1ETCEVRRFHeTfPqQzyZ5MbsvzhK-nIseedJ-JJz8zt9tMMjJ?type=png)](https://mermaid.live/edit#pako:eNp1Uk1rwzAM_StGZ2c0KynMt7EeBm0ZrDDY8EWN1cQ0kYvjsHal_32OwwZd15Of9J4e-vAJSmcIFGRZprl0vLWV0ixEh7yjY4IxqN3nGzY9dUpsseloTHMsfWxsxS1xUMLbqg6ak9NYnm0ooGbNT44DWiYviKv4yoVlI_N_iJVlu-s3NJCal7ZFuZh2Mhc_QeQ8U6BuVLySEc8YxMueeF3bbRBLV2ITfUrvUmLQ3VL9xrfM1shm4w5_he-u92JoU4wru-Sv2MtmrujLma7pYX6Q0JJv0Zp4rNOwfw2hppY0qAgN-p0Gzeeowz649ZFLUMH3JKHfGww0t1h5bEGlA0ogY4Pzq_H66RNI2CODOsEB1ETCEVRRFHeTfPqQzyZ5MbsvzhK-nIseedJ-JJz8zt9tMMjJ)

To connect to a remote Kubernetes, you can:

- Use your kube configuration
- Connect to Red Hat OpenShift Sandbox

To install a local Kubernetes cluster, you can:

- Install Kind and create a cluster on your container engine.
- Install Minikube and create a cluster on your container engine.
- Use a Lima virtual machine with k3s or Kubernetes.
- Install Red Hat OpenShift Local, and create a MicroShift or OpenShift instance.
