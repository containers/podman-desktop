---
sidebar_position: 2
title: Publishing
description: Publishing a Podman Desktop extension
tags: [podman-desktop, extension, publishing]
keywords: [podman desktop, extension, publishing]
---

# Creating and publishing a Podman Desktop extension

To enable users to install your extension, consider publishing your extension to an Open Container Initiative (OCI) image registry.

#### Prerequisites

* The extension builds successfully.
See [Writing a Podman Desktop extension](write).

Extension consists of a `zipped` file of all JavaScript files, dependencies, and metadata.

Extension assembly consists of a `.cdix` file or an `OCI` image.

Publishing to an `OCI` registry is the recommended way for the publication.


Considers building an `OCI` image to publish to quay.io, Docker Hub or other `OCI` registries.

#### Procedure

1. Create a `Containerfile` file, and start editing it.

1. Use a scratch image because the extension requires the content of the assembly, but no runtime:

   ```Dockerfile
   FROM scratch
   ```

1. Apply mandatory Podman Desktop metadata on the `OCI` image:

   ```Dockerfile
   LABEL org.opencontainers.image.title="My first extension" \
         org.opencontainers.image.description="Example of extension" \
         org.opencontainers.image.vendor="podman-desktop" \
         io.podman-desktop.api.version=">= 0.12.0"
   ```

   Using `io.podman-desktop.api.version=">= 0.12.0"` this extension will run only on Podman Desktop v0.12.0 or a more recent one.

1. Copy the extension assembly, including the metadata, icon, and production binary, to the `/extension` folder inside the image:

   ```
   COPY package.json /extension/
   COPY icon.png /extension/
   COPY dist /extension/dist
   ```

1. Build the image, ensuring that image is multi-arch (at least amd64 and arm64) to work on all supported Podman Desktop platforms.

   ```shell
   $ podman build --arch amd64,arm64 --manifest quay.io/fbenoit/my-first-extension .
   ```

1. Push the image and manifest to the OCI image registry:

   ```shell
   $ podman push quay.io/fbenoit/my-first-extension
   ```

   Ensuring that this repository is public. It means anyone can fetch the image.

1. Remember the name of the `OCI` image, for example `quay.io/fbenoit/my-first-extension`. You will need it to install the extension.

#### Next steps

* [Installing a Podman Desktop extension](install)
