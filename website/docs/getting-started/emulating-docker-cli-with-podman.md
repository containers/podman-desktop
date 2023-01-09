---
id: emulating-docker-cli-with-podman
title: Emulating Docker CLI with Podman
description: Emulation Docker CLI with Podman can make it easier to migrate from Docker to Podman, as it allows you to continue using familiar Docker commands while taking advantage of the benefits of Podman.
tags: [podman-desktop, getting-started, cli,]
keywords: [podman desktop, podman, containers]
---

# Emulating Docker CLI with Podman

Consider emulating Docker CLI with Podman to migrate transparently to Podman.

* Continue using familiar Docker commands.
* Take advantage of the benefits of Podman on macOS.
* Your tools, such as [Maven](https://maven.apache.org/) or [Testcontainers](https://www.testcontainers.org/), communicate with Podman without reconfiguration.

#### Prerequisites

* Podman

#### Procedure

1. Create a `/usr/local/bin/docker` script:

    ```shell
    #!/usr/bin/sh
    [ -e /etc/containers/nodocker ] || \
    echo "Emulate Docker CLI using podman. Create /etc/containers/nodocker to quiet msg." >&2
    exec /usr/bin/podman "$@"
    ```

2. Make the script executable:

    ```shell-session
    # chmod +x /usr/local/bin/docker 
    ```

#### Verification

* Use the `docker` script to run commands.
  Example:

    ```shell-session
    $ docker run -it docker.io/hello-world
    ```
