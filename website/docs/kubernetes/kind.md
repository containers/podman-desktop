---
sidebar_position: 1
title: Kind support
description: Kind is one way to get Kubernetes running on your workstation.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Kind

Kind is a command line tool that can create Kubernetes clusters on your favorite container engine.

It has experimental support for Podman.
However, Kind has specific requirements that need configuration tuning.

## Windows and WSL

Due to incompatibilities between WSL and systemd, Kind does not work with the rootless mode.
Therefore, to use Kind with your Podman machine, configure rootful mode.

### Configuring an existing Podman machine to run Kind

When you create a Podman machine, Podman creates two system connections:

* `rootless`
* `rootful` 

Kind use the default Podman connection.
Therefore you must set the default connection to `rootful`.

Run the following command:

```shell
podman system connection ls
```

You should see a similar output:
```
Name                         URI                                                          Identity                                   Default
podman-machine-default       ssh://user@localhost:54133/run/user/1000/podman/podman.sock  C:\Users\Jeff\.ssh\podman-machine-default  true
podman-machine-default-root  ssh://root@localhost:54133/run/podman/podman.sock            C:\Users\Jeff\.ssh\podman-machine-default  false
```

The rootful connection is suffixed by `-root`. If it is not the default one, you must issue the following command:

```shell
podman system connection default podman-machine-default-root
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

### Troubleshooting

On Windows/WSL, stopping the Podman machine while one or several Kind clusters are running is not recommended as the
stop command will emit an error message and the following Podman machine start seems to fail.

So it is recommended to stop all existing Kind clusters before the Podman machine is stopped. If you forgot to stop them
before you stop the Podman machine, there is still a workaround. The first start of the Podman machine will be reported
as successful but you won't be able to connect to it. Stop the Podman machine and restart it and you should be good.

#### Additional resources

* [Kind](https://kind.sigs.k8s.io/)

