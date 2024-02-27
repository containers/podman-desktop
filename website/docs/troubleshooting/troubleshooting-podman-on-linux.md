---
sidebar_position: 40
title: Podman on Linux
description: How to investigate when Podman does not work as expected.
---

# Troubleshooting Podman on Linux

## Podman Desktop does not manage native Podman

On Linux, Podman usually runs natively on the host.
Podman might also run in a virtual machine.

Podman Desktop does only connect to the native rootless podman connection.

Podman Desktop does not manage podman native configuration or podman machine (create, configure, start, stop, delete).

Podman Desktop might manage configuration relative to connections to registries and proxies.
