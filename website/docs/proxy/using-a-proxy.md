---
sidebar_position: 1
title: macOS and Windows
description: Using Podman Desktop behind a proxy on macOS and Windows.
tags: [podman-desktop, proxy, windows, macos]
keywords: [podman desktop, containers, podman, proxy, windows, macos]
---

# Using Podman Desktop behind a proxy on macOS and Windows

You can configure Podman Desktop to run behind a proxy.
The configuration applies to the Podman engine, but not to your containers.

#### Prerequisites

* Your proxy URL: `<your.proxy.tld:port>`.
* Your proxy does not require a custom Certificate Authorities. Else see [Using a proxy requiring a custom Certificate Authorities](using-a-proxy-requiring-a-custom-ca).

#### Procedure

1. Go to **Settings > Proxy**, and set your proxy URL:

   1. **Proxy configuration enabled**: yes
   1. **Web Proxy (HTTP)**: `<your.proxy.tld:port>`
   1. **Secure Web Proxy (HTTPS)**: `<your.proxy.tld:port>`
   1. Click the **Update** button

1. Go to **Settings > Resources** and restart the Podman machine.

#### Verification

1. Go to **Images**.
1. Click **Pull an image**.
1. **Image to Pull**: `bash`
1. Click **Pull image**.
1. Podman Desktop reports `Download complete`.

