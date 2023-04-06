---
sidebar_position: 2
title: Custom Certificate Authorities
description: Using Podman Desktop behind a proxy requiring custom Certificate Authorities (CA).
tags: [podman-desktop, installing, windows, macos, linux]
keywords: [podman desktop, containers, podman, installing, installation, windows, macos, linux]
---

# Using Podman Desktop behind a proxy requiring custom Certificate Authorities (CA) on macOS and Windows

You can configure Podman Desktop to run behind a proxy requiring custom Certificate Authorities (CA), such as self-signed certificates.
The configuration applies to the Podman engine, but not to your containers.

#### Prerequisites

* Your proxy URL: `<your.proxy.tld:port>`
* Your proxy Certificate Authorities (CA) is stored in your home directory, in the `proxy_ca.pem` file, in Privacy-Enhanced Mail (PEM) format.

#### Procedure

1. Go to **Settings > Proxy**, and set your proxy URL:

   1. **Proxy configuration enabled**: yes
   1. **Web Proxy (HTTP)**: `<your.proxy.tld:port>`
   1. **Secure Web Proxy (HTTPS)**: `<your.proxy.tld:port>`
   1. Click the **Update** button

1. Copy the certificate to the Podman machine:

    ```shell-session
    $ cat proxy_ca.pem | podman machine ssh podman-machine-default "cat > proxy_ca.pem"
    ```

1. Open a shell prompt on the Podman machine:

    ```shell-session
    $ podman machine ssh podman-machine-default
    ```

1. Add the custom Certificate Authorities (CA) for your proxy:

    ```shell-session
    $ sudo cp proxy_ca.pem /etc/pki/ca-trust/source/anchors/
    $ sudo update-ca-trust
   ```

1. Go to **Settings > Resources** and restart the Podman machine.

#### Verification

1. Go to **Images**.
1. Click **Pull an image**.
1. **Image to Pull**: `bash`
1. Click **Pull image**.
1. Podman Desktop reports `Download complete`.
