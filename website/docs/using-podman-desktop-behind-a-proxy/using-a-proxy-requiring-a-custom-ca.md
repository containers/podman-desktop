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

1. Go to **Settings > Proxy**, and set your proxy URL:

   1. **Proxy configuration enabled**: yes
   1. **Web Proxy (HTTP)**: `<your.proxy.tld:port>`
   1. **Secure Web Proxy (HTTPS)**: `<your.proxy.tld:port>`
   1. Click the **Update** button

1. Store the `<your-custom-ca.pem>` file in your `$HOME` directory.

1. (On Windows and macOS) Open a shell prompt on the Podman machine:

    ```powershell
    > podman machine ssh podman-machine-default
    ```

6. Add the custom Certificate Authorities (CA) for your proxy:

    ```shell-session
    $ sudo cp <your-custom-ca.pem> /etc/pki/ca-trust/source/anchors/
    $ sudo update-ca-trust
   ```

1. Go to **Settings > Resources** and restart the Podman machine.

#### Verification

1. Go to **Images**.
2. Click **Pull an image**.
3. **Image to Pull**: <a-test-image-name>.
4. Click **Pull image**.
4. Podman Desktop reports `Download complete`.
