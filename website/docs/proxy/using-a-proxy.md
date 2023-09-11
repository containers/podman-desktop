---
sidebar_position: 1
title: macOS and Windows
description: Using Podman Desktop behind a proxy on macOS and Windows.
tags: [podman-desktop, proxy, windows, macos]
keywords: [podman desktop, containers, podman, proxy, windows, macos]
---

# Using Podman Desktop behind a proxy on macOS and Windows

You can configure Podman Desktop to run behind a proxy.

The configuration applies to:

- Processes that Podman Desktop started, such as downloading Podman, Compose, or Kind installers.
- Podman engine.

The configuration does not apply to:

- Your Podman containers.
- Command line tools that Podman Desktop did not start.

#### Prerequisites

- Your proxy URL: `<your.proxy.tld:port>`.
- Your proxy does not require a custom Certificate Authorities. Else see [Using a proxy requiring a custom Certificate Authorities](using-a-proxy-requiring-a-custom-ca).

#### Procedure

1. Go to **Settings > Proxy**, and set your proxy URL:

   1. **Proxy configuration enabled**: yes
   1. **Web Proxy (HTTP)**: `<your.proxy.tld:port>`
   1. **Secure Web Proxy (HTTPS)**: `<your.proxy.tld:port>`
   1. Click the **Update** button

1. Go to **Settings > Resources** and restart the Podman machine.

#### Verification

1. You can install extensions such as:

   - [Installing Compose](/docs/compose/compose-spec)
   - [Installing Kind](/docs/kubernetes/kind/installing-kind).

2. Podman can pull images.
   1. Go to **Images**.
   2. Click **Pull an image**.
   3. **Image to Pull**: `bash`
   4. Click **Pull image**.
   5. Podman Desktop reports `Download complete`.

#### Additional resources

- [Using a proxy in your containers on macOS and Windows](/docs/proxy/using-a-proxy-in-your-containers)
