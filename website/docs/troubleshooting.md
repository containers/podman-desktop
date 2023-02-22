---
sidebar_position: 7
---

# Troubleshooting

If you cannot find your issue here or in the documentation, please fill an issue on our [repository](https://github.com/containers/podman-desktop/issues). You can also explore the [discussions](https://github.com/containers/podman-desktop/discussions) and do a search on similar issues on the [repository](https://github.com/containers/podman-desktop/issues).

## Podman Issues

### Unable to see any image or container after downloading Podman Desktop

#### System Requirements

The tool connects to Podman using the socket on the host on macOS and on a named pipe on Windows.
This is available only on Podman 4.0.2+
So, please check your version and update.

On Windows, the named pipe is `//./pipe/docker_engine` when Docker Desktop is not installed. It will be solved by https://github.com/containers/podman/issues/13502 / https://github.com/containers/podman/pull/13655. During that time, you may start Docker Desktop so the named pipe is the one expected.

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

### Unable to locate Podman Engine

#### Issue: 
Despite having Podman Engine installed, you may receive an error as follows -
```Error: No such keg: /usr/local/Cellar/podman```
or any similar error denoting that Podman Engine does not exist. 

#### Explanation: 
The Podman Installer and Homebrew use different locations to store the Podman Engine files in the file system. For example, Podman Installer installs Podman Engine in the path `/opt/podman` whereas Homebrew uses the path `/usr/local` for macOS Intel, `/opt/homebrew` for Apple Silicon and `/home/linuxbrew/.linuxbrew` for Linux.

#### Solution: 
To check where exactly is your Podman Engine installed, run the command-
```sh
which podman
``` 

This returns the path where the Podman Engine would be installed. This would help determine further action. 

For example, if you’re looking to completely uninstall Podman Engine from your system for a fresh installation, running `which podman` returns the exact path where Podman still exists. This could be the path where Podman Installer stores Podman Engine i.e. `/opt/podman`. Once you know the path, run:

```sh
sudo rm -rf /opt/podman
```

Or 

```sh
sudo rm -rf path-where-podman-exists
```

Here, you would replace `path-where-podman-exists` with the output of `which podman`.

You can now proceed for a fresh installation of Podman Desktop

### Unable to see information about active containers

#### Issue: 
In this scenario, the screen may be displaying "No Containers" as shown below despite active containers runnning in the background.
![img](img/containers_error.png)

#### Solution:
There are three ways to work this out.

1. To solve this issue, open the Terminal and run the following commands- 
```sh
podman machine stop
```

and then,

```sh
podman machine start
```

2. If this does not work for you, you may proceed with the following commands-
```sh
podman machine rm
```

and then,

```sh
podman machine init
```

3. If both of the abovementioned steps don't work for you, run the following commands-
```sh
rm -rf ~/.local/share/containers/podman
```

and then,

```sh
rm -rf ~/.config/containers/
```

After this, you can start off again by initializing a new Podman Machine and loading up the containers.

### Unable to set custom binary path for Podman on macOS

#### Issue:

When setting a custom binary path (under Preferences -> Custom binary path), Podman is unable to find `gvproxy` and `podman-mac-helper`:

```sh
Error: unable to start host networking: "could not find \"gvproxy\" in one of [/usr/local/opt/podman/libexec /opt/homebrew/bin /opt/homebrew/opt/podman/libexec /usr/local/bin /usr/local/libexec/podman /usr/local/lib/podman /usr/libexec/podman /usr/lib/podman $BINDIR/../libexec/podman].  To resolve this error, set the helper_binaries_dir key in the `[engine]` section of containers.conf to the directory containing your helper binaries."
```

#### Solution:

1. Download `gvproxy` from the [gvisor-tap-vsock release page](https://github.com/containers/gvisor-tap-vsock/releases).
2. Build the `podman-mac-helper` from the source code on the [Podman GitHub page](https://github.com/containers/podman/tree/main/cmd/podman-mac-helper).
3. Add the `helpers_binaries_dir` entry to `~/.config/containers/conf`:

```sh
[containers]

helper_binaries_dir=["/Users/user/example_directory"]
```

**NOTE**: A pre-built binary will be added to the Podman release page so you do not have to build `podman-mac-helper`. An [issue is open for this](https://github.com/containers/podman/issues/16746).

###  Warning about Docker compatibility mode


#### Issue:

When running the Podman provider, a warning shows regarding Docker compatibility mode on the dashboard:

```sh
⚠️ Docker Socket Compatibility: Podman is not emulating the default Docker socket path: '/var/run/docker.sock'. Docker-specific tools may not work. See troubleshooting page on podman-desktop.io for more information.
```

This may appear when either:
* The Docker socket is not mounted correctly
* Docker Desktop is also being ran at the same time 

#### Solution:

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

*Note:* If Docker Desktop is started again, it will automatically re-alias the default Docker socket location and the Podman compatibilty warning will re-appear.


## Code Ready Containers

- Check that Podman preset is defined. (`crc config get preset`)
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

### Podman machine on Apple Silicon

#### Issue

If you are using an Apple Silicon and brew, you might encounter the following error when starting Podman from Podman Desktop

```
Error: qemu exited unexpectedly with exit code 1, stderr: qemu-system-x86_64: invalid accelerator hvf
qemu-system-x86_64: falling back to tcg
qemu-system-x86_64: unable to find CPU model 'host'
```

#### Explanation

Podman machine is running as a `x86_64` process and it could be due to a dual install of homebrew: one for `x86_64` and one for `arm64`.

#### Solution

You can
1. Uninstall Podman machine on your `x86_64` brew install (for example from a terminal running under rosetta) `brew uninstall podman-machine`
2. or uninstall brew `x86_64` as most brew receipe have now arm64 support: follow [these instructions](https://github.com/homebrew/install#uninstall-homebrew) from a terminal running under rosetta

Then run a terminal in native mode (default) and install Podman machine `brew install podman-machine`

Finally clean the poddman machine VMs that had been previously created, a create new ones.

```
podman machine rm podman-machine-default
podman machine init
```

You should be a happy camper from here.
