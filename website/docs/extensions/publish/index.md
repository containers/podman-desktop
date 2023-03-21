---
sidebar_position: 3
title: Publishing
description: Publishing a Podman Desktop extension
tags: [podman-desktop, extension, publishing]
keywords: [podman desktop, extension, publishing]
---

# Packaging and publishing a Podman Desktop extension

To enable users to install your extension, consider publishing your extension to an Open Container Initiative (OCI) image registry.

#### Prerequisites

* The extension builds successfully.
See [Writing a Podman Desktop extension](write).

* All runtime dependencies are inside the final binary.

* An OCI image registry to publish to, such as `quay.io/fbenoit/my-first-extension`. 

* (Optional) The OCI image registry is public to enable anybody to fetch the image.

#### Procedure

1. Create and edit a `Containerfile` file.

1. Use a scratch image.
   The extension requires no runtime:

   ```dockerfile
   FROM scratch
   ```

1. Apply mandatory Podman Desktop metadata on the `OCI` image:

   ```dockerfile
   LABEL org.opencontainers.image.title="My first extension" \
         org.opencontainers.image.description="Example of extension" \
         org.opencontainers.image.vendor="podman-desktop" \
         io.podman-desktop.api.version=">= 0.12.0"
   ```

   `io.podman-desktop.api.version=">= 0.12.0"` sets the minimal Podman Desktop version that the extension requires to run.

1. Copy the extension assembly, including the metadata, icon, and production binary, to the `/extension` folder inside the image:

   ```dockerfile
   COPY package.json /extension/
   COPY icon.png /extension/
   COPY dist /extension/dist
   ```

1. Build a multi-arch image that works on all supported Podman Desktop platforms:

   ```shell-session
   $ podman build --arch amd64,arm64 --manifest quay.io/fbenoit/my-first-extension .
   ```

1. Push the image and manifest to the OCI image registry:

   ```shell-session
   $ podman push quay.io/fbenoit/my-first-extension
   ```

#### Next steps

* [Installing a Podman Desktop extension](install)
