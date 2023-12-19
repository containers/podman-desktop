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

- The extension builds successfully.
  See [Writing a Podman Desktop extension](/docs/extensions/write).

- All runtime dependencies are inside the final binary.

- An OCI image registry to publish to, such as `quay.io/fbenoit/my-first-extension`.

- (Optional) The OCI image registry is public to enable anybody to fetch the image.

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

1. Build an image:

   ```shell-session
   $ podman build -t quay.io/fbenoit/my-first-extension .
   ```

1. Push the image and manifest to the OCI image registry:

   ```shell-session
   $ podman push quay.io/fbenoit/my-first-extension
   ```

#### Adding platform-specific files

You may want to add a system-native executable to the extension's image, so the extension can execute it.

In contrast to the extension's code (transpiled into JavaScript) which is executable in any platform, you will
need to prepare several OCI images, one for each platform (OS and architecture) you want the extension to support.

For this, you will need to create:

- one Containerfile for each platform (or a common Containerfile with parameters), to create
  one image per platform,
- one manifest, to reference all images created at the previous step.

The URL you need to share with the users to install the extension is the URL of the manifest.

If the manifest does not contain an image for the platform of the user, Podman Desktop will install the
image for Linux (amd64 or arm64 depending on the architecture of the user's platform).

You can leverage the [Buildah Build action](https://github.com/redhat-actions/buildah-build) to build this manifest.

#### Next steps

- [Installing a Podman Desktop extension](/docs/extensions/install)
