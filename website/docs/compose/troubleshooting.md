---
title: Troubleshooting Compose
description: Troubleshooting compose issues
sidebar_position: 3
keywords: [compose]
tags: [compose]
---

# Troubleshooting Compose

## Registry authentication issues

The Compose binary will prioritize the configuration file `~/.docker/config` over Podman credentials.

### Issues encountered

`docker-credential-desktop` missing:

```console
docker.credentials.errors.InitializationError: docker-credential-desktop not installed or not available in PATH
```

Authentication access:

```console
Error response from daemon: {"message":"denied: requested access to the resource is denied"}
Error: executing /usr/local/bin/docker-compose up: exit status 18
```

### Solution

Delete the `~/.docker/config` to clear any errors.
