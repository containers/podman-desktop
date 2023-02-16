---
sidebar_position: 1
title: Kind support
description: Kind is one way to get Kubernetes running on your workstation.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Kind

Kind is a command line tool that can create Kubernetes clusters on your favorite container engine.

It has experimental support for Podman. However, Kind has specific requirements that needs configuration tuning.

## Windows and WSL

Due to incompatibilities between WSL and systemd, Kind does not work with the rootless mode. So if you want to use Kind
with your Podman machine, you need to configure rootful mode.

### Existing Podman machine

When you create a Podman machine, two system connections will be created. One of them is the rootless one and the other
is the rootful. As kind will use the default Podman connection, you need to make sure it is the rootful.

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

### New Podman machine

If you don't have already an existing Podman machine or you want to create a new one for Kind and Kubernetes, you need
to create it with the `-rootful` flag:

```shell
podman machine init --rootful my-machine-name
```

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

