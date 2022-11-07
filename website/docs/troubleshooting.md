---
sidebar_position: 4
---

# Troubleshooting

If you cannot find your issue here or in the documentation, please fill an issue on our [repository](https://github.com/containers/podman-desktop/issues). You can also explore the [discussions](https://github.com/containers/podman-desktop/discussions) and do a search on similar issues on the [repository](https://github.com/containers/podman-desktop/issues).

## Podman Issues

### Getting Started

System Requirements

The tool connects to Podman using the socket on the host on macOS and on a named pipe on Windows. This is available only on podman 4.0.2+
So, please check your version and update.

On Windows, the named pipe is `//./pipe/docker_engine` when Docker Desktop is not installed. It will be solved by https://github.com/containers/podman/issues/13502 / https://github.com/containers/podman/pull/13655. During that time, you may start Docker Desktop so the named pipe is the one expected.

#### Solution: Check connection

Check at least a podman machine is running on Windows & macOS:

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

### Unable to locate Podman Engine

#### Issue: 
Despite having Podman Engine installed, you may receive an error as follows -
```Error: No such keg: /usr/local/Cellar/podman```
or any similar error denoting that Podman Engine does not exist. 

#### Explanation: 
The Podman Installer and Homebrew use different locations to store the Podman Engine files in the file system. For example, Podman Installer installs Podman Engine in the path `/opt/podman` whereas Homebrew uses the path `/usr/local` for macOS Intel, `/opt/homebrew` for Apple Silicon and `/home/linuxbrew/.linuxbrew` for Linux.

#### Solution: 
To check where exactly is your Podman Engine installed, run the command `which podman`. This returns the path where the Podman Engine would be installed. This would help determine further action. 

For example, if you’re looking to completely uninstall Podman Engine from your system for a fresh installation, running `which podman` returns the exact path where Podman still exists. This could be the path where Podman Installer stores Podman Engine i.e. `/opt/podman`. Once you know the path, simply run 

`sudo rm -rf /opt/podman`

Or 

`sudo rm -rf path-where-podman-exists`

Here, you would replace `path-where-podman-exists` with the output of `which podman`.

You can now proceed for a fresh installation of Podman Desktop

## Code Ready Containers

- Check that podman preset is defined. (`crc config get preset`)
- Check that `crc` binary is available in the user PATH (`/usr/local/bin/crc`)
- Check that `crc setup --check-only` is running without errors.

## Other Issues

### Fixing corrupted Podman Machine in Windows

If at all you are not able to stop your Podman Machine, you will find such an error in the Logs-
```Error: Error stopping sysd: exit status 1```

It is highly unlikely that you may be stuck in such a situation but if you are, here's a quick fix for it.

Assuming the name of the Podman Machine to be `my-machine`, run the following commands in the terminal:

```sh
wsl --list
```

This shall display a list of active distributions i.e. `my-machine` in this case.

Then,

```sh
wsl --unregister my-machine
```
(Replacing `my-machine` with the name that is displayed under `wsl --list` for your Podman Machine)

This will stop the Podman Machine for you.

