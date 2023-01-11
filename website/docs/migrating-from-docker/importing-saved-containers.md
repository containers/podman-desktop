---
sidebar_position: 1
title: Importing saved containers
description: Import saved containers to migrate transparently to Podman, and continue using familiar containers.
keywords: [podman desktop, podman, containers, importing]
tags: [migrating-from-docker]
---

# Importing saved containers to Podman

Consider importing saved containers to continue using familiar containers.

#### Prerequisites

* Podman
* You saved your existing Docker containers by running the command:

    ```shell-session
    $ docker save <your_container> > <your_container_archive>.tar
    ```
* You saved your existing Podman containers by running the command:

    ```shell-session
    $ podman save <your_container> > <your_container_archive>.tar
    ```

#### Procedure

* Import your existing containers into Podman.
  Run the command for each container archive:

     ```shell-session
     $ podman import <your_container_archive>.tar
     ```

#### Verification

* Your imported containers appear in the Podman Desktop *Images* section.

#### Additional resources

* [`docker save` reference documentation](https://docs.docker.com/engine/reference/commandline/save/)
* [`podman save` reference documentation](https://docs.podman.io/en/latest/markdown/podman-save.1.html)
* [`podman import` reference documentation](https://docs.podman.io/en/latest/markdown/podman-import.1.html)
