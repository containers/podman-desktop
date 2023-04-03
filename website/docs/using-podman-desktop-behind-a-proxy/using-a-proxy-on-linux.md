---
sidebar_position: 3 title: Using behind a proxy description: Using Podman Desktop behind a proxy requiring custom Certificate Authorities (CA). tags: [podman-desktop, installing, windows, macos, linux]
keywords: [podman desktop, containers, podman, installing, installation, windows, macos, linux]
---

# Using Podman Desktop behind a proxy requiring custom Certificate Authorities (CA)

Podman Desktop can configure a proxy for the Podman engine.

You can use Podman Desktop behind a proxy requiring custom Certificate Authorities (CA), such as self-signed certificates.

#### Prerequisites

* `<your-custom-ca.pem>`: Your proxy Certificate Authorities (CA), in Privacy-Enhanced Mail (PEM) format.
* `<your.proxy.tld:port>`: Your proxy URL.

#### Procedure

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

1. Set the proxy environment variables to pass into the Podman engine:

      ```toml
      [engine]
      env = ["http_proxy=<your.proxy.tld:port>", "https_proxy=<your.proxy.tld:port>"]
      ```

1. Add the custom Certificate Authorities (CA) for your proxy:

    ```shell-session
    # cp <your-custom-ca.pem> /etc/pki/ca-trust/source/anchors/
    # update-ca-trust
   ```

1. Restart Podman.
