---
sidebar_position: 40
---

# Troubleshooting Podman on Linux

## Podman Desktop does not manage native Podman

On Linux, Podman usually runs natively on the host.
Podman might also run in a virtual machine.
Podman Desktop does only connect to the native rootless podman connection.

Podman Desktop does not manage podman native configuration or podman machine (create, configure, start, stop, delete).
