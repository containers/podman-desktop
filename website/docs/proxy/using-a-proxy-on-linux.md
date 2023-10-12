---
sidebar_position: 4
title: Proxy on Linux
description: Using Podman Desktop behind a proxy on Linux.
tags: [podman-desktop, proxy, linux]
keywords: [podman desktop, containers, podman, proxy, linux]
---

# Using Podman Desktop behind a proxy on Linux

You can configure Podman to run behind a proxy.

#### Prerequisites

- `<proxy_ca.pem>`: Your proxy Certificate Authorities (CA), in Privacy-Enhanced Mail (PEM) format.
- `<your.proxy.tld:port>`: Your proxy URL.

#### Procedure

1. Edit the `containers.conf` file to pass the proxy environment variables to Podman CLI.

   The file location depends on your connection mode:

   - `rootless`: `$HOME/.config/containers/containers.conf`

   - `rootful`: `/etc/containers/containers.conf`

1. Set the proxy environment variables to pass into the containers:

   ```toml
   [containers]
   http_proxy = true
   env = ["http_proxy=<your.proxy.tld:port>", "https_proxy=<your.proxy.tld:port>"]
   ```

1. Set the proxy environment variables to pass into the Podman engine:

   ```toml
   [engine]
   env = ["http_proxy=<your.proxy.tld:port>", "https_proxy=<your.proxy.tld:port>"]
   ```

1. Add the custom Certificate Authorities (CA) for your proxy:

   ```shell-session
   $ sudo cp <proxy_ca.pem> /etc/pki/ca-trust/source/anchors/
   $ sudo update-ca-trust
   ```

1. Restart all `podman` processes.

   ```shell-session
   $ pkill podman
   ```

1. Restart Podman Desktop: <kbd>Ctrl</kbd> + <kbd>q</kbd>.

#### Verification

1. Go to **Images**.
1. Click **Pull an image**.
1. **Image to Pull**: `bash`
1. Click **Pull image**.
1. Podman Desktop reports `Download complete`.
