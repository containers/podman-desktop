---
sidebar_position: 3 title: Using behind a proxy description: Using Podman Desktop behind a proxy requiring custom Certificate Authorities (CA). tags: [podman-desktop, installing, windows, macos, linux]
keywords: [podman desktop, containers, podman, installing, installation, windows, macos, linux]
---

# Using a proxy in your containers

Podman Desktop configures the proxy for the Podman engine.

#### Prerequisites

* `<your.proxy.tld:port>`: Your proxy URL.

#### Procedure

1. (On Windows and macOS) Open a shell prompt on the Podman machine:

    ```commandline
    $ podman machine ssh
    ```

2. Edit the `containers.conf` file to pass the proxy environment variables to Podman CLI.

   The file location depends on your connection mode:

  * `rootless`: `$HOME/.config/containers/containers.conf`

  * `rootful`: `/etc/containers/containers.conf`

4. Set the proxy environment variables to pass into the containers:

      ```toml
      [containers]
      http_proxy = true
      env = ["http_proxy=<your.proxy.tld:port>", "https_proxy=<your.proxy.tld:port>"] 
      ```

1. The configuration changes do not apply to running or stopped containers. 
   Go to **Containers** and delete all containers that require the proxy settings.
