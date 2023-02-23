---
sidebar_position: 3
title: Using behind a proxy
description: Using Podman Desktop behind a proxy requiring custom Certificate Authorities (CA).
tags: [podman-desktop, installing, windows, macos, linux]
keywords: [podman desktop, containers, podman, installing, installation, windows, macos, linux]
---

# Using Podman Desktop behind a proxy requiring custom Certificate Authorities (CA)

You can use Podman Desktop behind a proxy requiring custom Certificate Authorities (CA), such as self-signed certificates.

#### Prerequisites

* `<your-custom-ca.pem>`: Your proxy Certificate Authorities (CA), in PEM format.
* `<your.proxy.tld>`: Your proxy URL.

#### Procedure

1. (On Windows and macOS) Open a shell session on the Podman machine:

    ```commandline
    $ podman machine ssh
    ```

2. Edit the `containers.conf` file to pass the proxy environment variables to Podman.

   The file location depends on your connection mode:

   * `rootless`: `$HOME/.config/containers/containers.conf`

   * `rootful`: `/etc/containers/containers.conf`

3. Pass the default proxy environment variables into the containers:

    ```toml
    [containers]
    http_proxy = true
    ```

4. Set the proxy environment variables to pass into the containers:

      ```toml
      [containers]
      http_proxy = true
      env = ["http_proxy=<your.proxy.tld>", "https_proxy=<your.proxy.tld>"] 
      ```

5. Set the proxy environment variables to pass into the Podman engine:

      ```toml
      [engine]
      env = ["http_proxy=<your.proxy.tld>", "https_proxy=<your.proxy.tld>"]
      ```

6. Add the custom Certificate Authorities (CA) for your proxy:

    ```commandline
    # cp <your-custom-ca.pem> /etc/pki/ca-trust/source/anchors/
    # update-ca-trust
   ```
