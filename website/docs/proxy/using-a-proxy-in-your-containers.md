---
sidebar_position: 3
title: In your containers
description: Using Podman Desktop behind a proxy requiring custom Certificate Authorities (CA).
tags: [podman-desktop, installing, windows, macos, linux]
keywords: [podman desktop, containers, podman, installing, installation, windows, macos, linux]
---

# Using a proxy in your containers on macOS and Windows

You can configure your Podman machine to use a proxy for your containers.

#### Prerequisites

* `<your.proxy.tld:port>`: Your proxy URL.

#### Procedure

1. Open a shell prompt on the Podman machine:

    ```commandline
    $ podman machine ssh
    ```

1. Edit the `containers.conf` file to pass the proxy environment variables to Podman CLI.

   The file location depends on your connection mode:

   * `rootless`: `$HOME/.config/containers/containers.conf`

   * `rootful`: `/etc/containers/containers.conf`

1. Set the proxy environment variables to pass into the containers:

      ```toml
      [containers]
      http_proxy = true
      env = ["http_proxy=<your.proxy.tld:port>", "https_proxy=<your.proxy.tld:port>"] 
      ```

1. Go to **Settings > Resources** and restart the Podman machine.
