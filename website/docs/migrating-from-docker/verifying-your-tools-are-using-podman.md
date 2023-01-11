---
sidebar_position: 5
title: Verifying your tools are using Podman
description: Verify that your tools are using Podman rather than Docker.
keywords: [podman desktop, podman, containers, migrating, docker]
tags: [migrating-from-docker]
---

# Verifying that your tools are using Podman

When you have configured your host to use Podman rather then Docker, consider verifying your setup works as intended.

#### Prerequisites

* Docker service is stopped, or not installed.
* [Saved containers are imported to Podman](importing-saved-containers)
* [The `DOCKER_HOST` environment variable is set](using-the-docker_host-environment-variable)
* [On macOS, the `podman-mac-helper` service is running](using-podman-mac-helper)
* [Podman is emulating Docker CLI](emulating-docker-cli-with-podman)

#### Procedure

1. The Docker socket replies successfully for listing all containers:


    * On Linux and macOS
    
      ```shell-session
      $ curl --unix-socket /var/run/docker.sock "http:/v1.41/containers/json?all=true"
      ```

    * On Windows
    
      ```shell-session
      $ curl --unix-socket npipe:////./pipe/docker_engine "http:/v1.41/containers/json?all=true"
      ```


2. Podman commands run successfully when redirected to the Docker socket:

    * On Linux and macOS
    
      ```shell-session
      $ CONTAINER_HOST=/var/run/docker.sock podman ps
      ```

    * On Windows
    
      ```shell-session
      $ CONTAINER_HOST=npipe:////./pipe/docker_engine podman ps
      ```

