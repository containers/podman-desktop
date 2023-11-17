---
sidebar_position: 10
title: Authenticating to a registry
description: Authenticating to a pre-configured registry.
keywords: [podman desktop, podman, containers, registry, registries]
tags: [images]
---

import Verification from './\_verification-private-registry.md'

# Authenticating to a pre-configured registry

With Podman Desktop, you can authenticate to a set of pre-configured registries:

- Red Hat Quay
- Docker Hub
- GitHub
- Google Container registry

#### Prerequisites

- You have credentials on a pre-configured image registry.

#### Procedure

1. Go to **<Icon icon="fa-solid fa-cog" size="lg" /> Settings > Registries**.
1. On your registry line, click **Configure**.

   1. **User name**: Enter your user name.
   1. **Password**: Enter your password or OAuth secret.
   1. Click **Login**.

   ![Authenticating to a preconfigured registry](img/authenticating-to-a-preconfigured-registry.png)

<Verification />
