---
sidebar_position: 10
title: Adding an insecure registry
description: Modifying Podman for an insecure registry
keywords: [podman desktop, podman, containers, registry, podman machine]
tags: [pods]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Adding an Insecure Registry to Podman Desktop

In this guide, you will learn how to add an insecure registry to Podman Desktop. An insecure registry allows you to pull and push container images over an unencrypted HTTP connection instead of a secure HTTPS connection. Please note that using an insecure registry can expose your data to security risks, so it's recommended to use secure connections whenever possible.

#### Prerequisites

- Podman installed and running (VM if on macOS or Windows)

#### Procedure

1. Click on "Add Registry" within Registries on the Settings page of Podman Desktop.

![Podman Desktop Add Registry](img/add-registry.png)

2. Click "Yes" to the insecure registry warning.

![Podman Desktop Registry Warning](img/registry-warning.png)

3. If running a Podman Machine VM, SSH into the machine.

```sh
$ podman machine ssh
```

4. Open `registries.conf`.

```sh
$ sudo vi /etc/containers/registries.conf
```

5. Add the insecure registry: Under the [registries.insecure] section, add the URL of the insecure registry you want to use. For example, if your insecure registry is located at http://example-registry.com, add the following line:

```sh
[registries.insecure]
registries = ['example-registry.com']
```

If you have multiple registries, you can add them using the same format:

```sh
[registries.insecure]
registries = ['example-registry1.com', 'example-registry2.com']
```

6. Save and exit the file.

7. Restart Podman.

Mac & Windows:

```sh
$ podman machine stop
$ podman machine start
```

Linux:

```sh
$ sudo systemctl restart podman
```

8. Pull or push container images: You can now use Podman Desktop to pull or push container images from/to the insecure registry you added.
