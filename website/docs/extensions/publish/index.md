---
sidebar_position: 2
title: Publishing
description: Publish Podman Desktop extension
tags: [podman-desktop, extension, publishing]
keywords: [podman desktop, extension, publishing]
---

#### Prerequisites

* [Writing Extension](../extensions/write)

Consider publishing and distributing because extension builds successfully.

Extension consists of a `zipped` file of all JavaScript files, dependencies, and metadata.

Extension assembly consists of a .cdix file or an `OCI` image.

Publishing to an `OCI` registry is the recommended way for the publication.


### Creating the `OCI` image and publish image

Considers building an `OCI` image to publish to quay.io, Docker Hub or other `OCI` registries

#### Containerfile example

1. Use a scratch image because it only requires the content of the assembly, no runtime.

  ```Dockerfile
  FROM scratch
  ```

1. Apply mandatory Podman Desktop metadata on the `OCI` image

  ```Dockerfile
  LABEL org.opencontainers.image.title="My first extension" \
        org.opencontainers.image.description="Example of extension" \
        org.opencontainers.image.vendor="podman-desktop" \
        io.podman-desktop.api.version=">= 0.12.0"
  ```
  
  Using `io.podman-desktop.api.version=">= 0.12.0"` this extension will run only on Podman Desktop v0.12.0 or a more recent one.

1. Copy the extension assembly to the image (including the metadata, icon, and production binary) to `/extension` folder inside the image.

  ```
  COPY package.json /extension/
  COPY icon.png /extension/
  COPY dist /extension/dist
  ```

1. Build the image, ensuring that image is multi-arch (at least amd64 and arm64) to work on all supported Podman Desktop platforms.

  ```shell
  podman build -t foo2 --arch amd64,arm64 --manifest quay.io/fbenoit/my-first-extension .
  ```


#### Publish the image to an `OCI` registry

In the earlier step, manifest is `quay.io/fbenoit/my-first-extension`.

Push the image and manifest to quay.io

```shell
  podman push quay.io/fbenoit/my-first-extension
```

Ensuring that this repository is public. It means anyone can fetch the image.

Install this extension by using the name of the `OCI` image from the earlier step, for example `quay.io/fbenoit/my-first-extension` 

#### Next steps

* [Install extension](../extensions/install)
