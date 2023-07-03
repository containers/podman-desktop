---
sidebar_position: 2
---

# Troubleshooting Podman

## Check for available space before initializing a Podman machine

#### Issue

When the available disk space left is not enough, initializing a Podman machine might fail.

#### Workaround

Verify the available space before initializing a Podman machine.

## Unable to see any image or container

#### Issue

1. You installed Podman Desktop and Podman.
1. On Windows and macOS, you initialized and started a Podman machine.
1. You pulled images to Podman.
1. You started containers in Podman.
1. You are unable to see any image or container in Podman Desktop.

   ![img](./img/containers_error.png)

### Verifying system requirements

1. Podman Desktop requires Podman 4.0.2 or greater, to connect to Podman by using the socket on the host on macOS and a named pipe on Windows.

2. On Windows, when Docker Desktop is not running, Podman Desktop requires Podman 4.1 or greater, to start Podman with the expected named pipe. Else Podman start with the named pipe is `//./pipe/docker_engine` See: <https://github.com/containers/podman/issues/13502> / <https://github.com/containers/podman/pull/13655>.

### Verifying that on

1. On Windows and macOS, verify that at least one Podman machine is running:

   ```shell-session
   $ podman machine list
   ```

### Verifying the connection to Podman

1. To verify that you can connect to Podman by using the CLI, run a dummy container:

   ```shell-session
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

1. To restart the Podman machine, in a terminal, run:

   ```shell-session
   podman machine stop
   podman machine start
   ```

1. To delete the Podman machine, and create another Podman machine, in a terminal, run:

   ```shell-session
   $ podman machine rm
   $ podman machine init
   ```

1. To delete all containers-related configuration files:

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

This may appear when either:

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
