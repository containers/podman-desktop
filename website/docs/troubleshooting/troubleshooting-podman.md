---
sidebar_position: 10
---

#

### Unable to see any image or container after downloading Podman Desktop

#### System Requirements

The tool connects to Podman using the socket on the host on macOS and on a named pipe on Windows.
This is available only on Podman 4.0.2+
So, please check your version and update.

On Windows, the named pipe is `//./pipe/docker_engine` when Docker Desktop is not installed. It will be solved by <https://github.com/containers/podman/issues/13502> / <https://github.com/containers/podman/pull/13655>. During that time, you might start Docker Desktop so the named pipe is the one expected.

#### Check connection

Check at least a Podman machine is running on Windows & macOS:

```bash
podman machine list
```

And check a connection can be made with the CLI

```sh
$ podman run quay.io/podman/hello
!... Hello Podman World ...!

         .--"--.
       / -     - \
      / (O)   (O) \
   ~~~| -=(,Y,)=- |
    .---. /`  \   |~~
 ~/  o  o \~~~~.----. ~~
  | =(X)= |~  / (O (O) \
   ~~~~~~~  ~| =(Y_)=-  |
  ~~~~    ~~~|   U      |~~

Project:   https://github.com/containers/podman
Website:   https://podman.io
Documents: https://docs.podman.io
Twitter:   @Podman_io
```

### Unable to see information about active containers

#### Issue

In this scenario, the screen might be displaying "No Containers" as shown below despite active containers runnning in the background.
![img](../img/containers_error.png)

#### Solution

There are three ways to work this out.

1. To solve this issue, open the Terminal and run the following commands-

   ```shell-session
   podman machine stop
   podman machine start
   ```

2. If this does not work for you, you might proceed with the following commands-

   ```shell-session
   $ podman machine rm
   $ podman machine init
   ```

3. If both of the abovementioned steps don't work for you, run the following commands-

   ```shell-session
   $ rm -rf ~/.local/share/containers/podman
   $ rm -rf ~/.config/containers/
   ```

   After this, you can start off again by initializing a new Podman Machine and loading up the containers.

### Warning about Docker compatibility mode

#### Issue

When running the Podman provider, a warning shows regarding Docker compatibility mode on the dashboard:

```sh
⚠️ Docker Socket Compatibility: Podman is not emulating the default Docker socket path: '/var/run/docker.sock'. Docker-specific tools may not work. See troubleshooting page on podman-desktop.io for more information.
```

This might appear when either:

- The Docker socket is not mounted correctly
- Docker Desktop is also being ran at the same time

#### Solution

**On macOS:**

1. Stop Docker Desktop (if install)
2. Run the `podman-mac-helper` binary:

   ```sh
   sudo podman-mac-helper install
   ```

   for additional options please run the command:

   ```sh
   sudo podman-mac-helper install --help
   ```

3. Restart the Podman machine (the default Docker socket path will be recreated and Podman will emulate it)

**On Linux / Windows:**

1. Stop Docker Desktop (if installed)
2. Restart the Podman machine (the default Docker socket path will be recreated and Podman will emulate it)

_Note:_ If Docker Desktop is started again, it will automatically re-alias the default Docker socket location and the Podman compatibilty warning will re-appear.
