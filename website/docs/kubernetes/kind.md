---
sidebar_position: 1
title: Kind support
description: Kind is one way to get Kubernetes running on your workstation.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Running Kubernetes on your workstation with Kind

Kind is a command line tool that can create Kubernetes clusters on your favorite container engine.

It has experimental support for Podman.
However, Kind has specific requirements that need configuration tuning.

## Running Kind on Windows Subsystem for Linux (WSL)

Due to incompatibilities between WSL and systemd, Kind does not work with the `rootless` mode.
Therefore, to use Kind with your Podman machine, configure `rootful` mode.

### Configuring an existing Podman machine to run Kind

When you create a Podman machine, Podman creates two system connections:

* `rootless`
* `rootful`

Kind use the default Podman connection.
Therefore, you must set the default connection to `rootful`.

#### Procedure

1. List the Podman system connections:

  ```shell
  > podman system connection ls
You should see a similar output:
  ```shell
  Name                         URI                                                          Identity                                   Default
  podman-machine-default       ssh://user@localhost:54133/run/user/1000/podman/podman.sock  C:\Users\Jeff\.ssh\podman-machine-default  true
  podman-machine-default-root  ssh://root@localhost:54133/run/podman/podman.sock            C:\Users\Jeff\.ssh\podman-machine-default  false
  ```

2. Modify the default connection to be rootful

The rootful connection is suffixed by `-root`. If it is not the default one, you must issue the following command:

  ```shell
  > podman system connection default podman-machine-default-root
  ```

### Creating a Podman machine ready to run Kind

#### Prerequisites

* No existing Podman machine 

#### Procedure

* Create a rootful Podman machine:

  ```shell
  podman machine init --rootful my-machine-name

If this is the only Podman machine, it will be created and the default machine connection will be the rooful one so
there is no extra configuration required.

If there are several Podman machine, proceed as in [Existing Podman machine](#exiting-podman-machine)

### Restarting a Podman machine running Kind on Windows

On Windows/WSL, avoid stopping the Podman machine while one or several Kind clusters are running. 
The stop command emits an error message, and the following Podman machine start seems to fail.


#### Procedure

1. Stop all existing Kind clusters.
2. Stop the Podman machine.
3. Start the Podman machine.

#### Workaround

1. Keep existing Kind clusters running.
2. Stop the Podman machine.
3. Start the Podman machine.
4. The Podman machine start reports success, but you cannot connect to the Podman machine.
5. Stop the Podman machine.
6. Start the Podman machine.

#### Additional resources

* [Kind](https://kind.sigs.k8s.io/)

