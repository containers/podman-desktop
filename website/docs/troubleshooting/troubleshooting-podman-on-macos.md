---
sidebar_position: 30
title: Podman on MacOS
description: How to investigate when Podman does not work as expected.
---

# Troubleshooting Podman on macOS

## Unable to set custom binary path for Podman on macOS

#### Issue

When setting a custom binary path (under Preferences -> Custom binary path), Podman is unable to find `gvproxy` and `podman-mac-helper`:

```sh
Error: unable to start host networking: "could not find \"gvproxy\" in one of [/usr/local/opt/podman/libexec /opt/homebrew/bin /opt/homebrew/opt/podman/libexec /usr/local/bin /usr/local/libexec/podman /usr/local/lib/podman /usr/libexec/podman /usr/lib/podman $BINDIR/../libexec/podman].  To resolve this error, set the helper_binaries_dir key in the `[engine]` section of containers.conf to the directory containing your helper binaries."
```

#### Solution

1. Download `gvproxy` from the [gvisor-tap-vsock release page](https://github.com/containers/gvisor-tap-vsock/releases).
2. Build the `podman-mac-helper` from the source code on the [Podman GitHub page](https://github.com/containers/podman/tree/main/cmd/podman-mac-helper).
3. Add the `helpers_binaries_dir` entry to `~/.config/containers/conf`:

```sh
[containers]

helper_binaries_dir=["/Users/user/example_directory"]
```

**NOTE**: A pre-built binary will be added to the Podman release page so you do not have to build `podman-mac-helper`. An [issue is open for this](https://github.com/containers/podman/issues/16746).

## Unable to locate Podman Engine

#### Issue

Despite having Podman Engine installed, you might receive an error as follows -
`Error: No such keg: /usr/local/Cellar/podman`
or any similar error denoting that Podman Engine does not exist.

#### Explanation

The Podman Installer and Homebrew use different locations to store the Podman Engine files in the file system. For example, Podman Installer installs Podman Engine in the path `/opt/podman` whereas Homebrew uses the path `/usr/local` for macOS Intel, `/opt/homebrew` for Apple Silicon and `/home/linuxbrew/.linuxbrew` for Linux.

#### Solution

To check where exactly is your Podman Engine installed, run the command-

```sh
which podman
```

This returns the path where the Podman Engine would be installed. This would help determine further action.

For example, if you’re looking to completely uninstall Podman Engine from your system for a fresh installation, running `which podman` returns the exact path where Podman still exists. This could be the path where Podman Installer stores Podman Engine, such as `/opt/podman`. Once you know the path, run:

```sh
sudo rm -rf /opt/podman
```

Or

```sh
sudo rm -rf path-where-podman-exists
```

Here, you would replace `path-where-podman-exists` with the output of `which podman`.

You can now proceed for a fresh installation of Podman Desktop

## Podman machine on Apple Silicon

#### Issue

If you are using an Apple Silicon and brew, you might encounter the following error when starting Podman from Podman Desktop

```shell-session
Error: qemu exited unexpectedly with exit code 1, stderr: qemu-system-x86_64: invalid accelerator hvf
qemu-system-x86_64: falling back to tcg
qemu-system-x86_64: unable to find CPU model 'host'
```

#### Explanation

Podman machine is running as a `x86_64` process and it could be due to a dual install of homebrew: one for `x86_64` and one for `arm64`.

#### Solution

You can

1. Uninstall Podman machine on your `x86_64` brew install (for example from a terminal running under rosetta) `brew uninstall podman`
2. or uninstall brew `x86_64` as most brew receipe have now arm64 support: follow [these instructions](https://github.com/homebrew/install#uninstall-homebrew) from a terminal running under rosetta

Then run a terminal in native mode (default) and install Podman machine `brew install podman`

Finally clean the Podman machine VMs that had been previously created, and create new ones.

```shell-session
$ podman machine rm podman-machine-default
$ podman machine init
```

You should be a happy camper from here.

## Recovering from a failed start

After a failed start, the Podman machine might be unable to start because a QEMU process is still running and the PID file is in use.

#### Workaround

1. Kill the remaining QEMU process and stop the Podman machine:

   ```shell-session
   $ ps -edf | grep qemu-system | grep -v grep | awk '{print $2}' | xargs -I{} kill -9 {}; podman machine stop
   ```

2. Start the Podman machine.

#### Solution

Use Podman 4.6.1 or greater.

## Podman machine not starting with QEMU 8.1.0 from brew

When you installed Podman and QEMU with brew, and QEMU version is 8.1.0, Podman machine might fail to start with an error such as:
`Error: qemu exited unexpectedly with exit code -1, stderr: qemu-system-x86_64: Error: HV_DENIED`

#### Solution

- [Install Podman Desktop and Podman using the .dmg installer](/docs/installation/macos-install) rather than brew.
  The Podman installer has a QEMU binary that has been tested with Podman.

#### Workaround

Keep your brew-based installation and apply one of these workarounds:

- Rollback the QEMU brew package to v8.0.3.

  ```shell-session
  $ brew uninstall qemu
  $ curl -OSL https://raw.githubusercontent.com/Homebrew/homebrew-core/dc0669eca9479e9eeb495397ba3a7480aaa45c2e/Formula/qemu.rb
  $ brew install ./qemu.rb
  ```

- Alternatively, sign the QEMU brew binary locally:

  ```shell-session
  $ cat >entitlements.xml <<EOF
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
  <dict>
    <key>com.apple.security.hypervisor</key>
    <true/>
  </dict>
  </plist>
  EOF
  $ codesign --sign - --entitlements entitlements.xml --force /usr/local/bin/qemu-system-$(uname -m | sed -e s/arm64/aarch64/)
  ```

#### Additional resources

- [Homebrew issue #140244](https://github.com/Homebrew/homebrew-core/issues/140244).
- [Podman issue #19708](https://github.com/containers/podman/issues/19708).

## On Apple Silicon, the Podman Machine does not start

On Apple Silicon, when Podman Machine starts, it stays indefinitely blocked with a _Waiting for VM_ message.

#### Solution

For M1 and M2 processors:

- Update to Podman 4.9.

#### Workaround

For M3 processors:

1. To get a clean environment, remove all Podman and qemu artifacts:

   1. Remove eventual installation from podman/podman desktop installer:

      ```shell-session
      $ sudo rm -rf opt/podman
      ```

   1. Remove brew installations:

      ```shell-session
      $ brew uninstall podman-desktop
      $ brew uninstall podman
      $ brew uninstall qemu
      ```

   1. Remove Podman files:

      ```shell-session
      $ rm -rf ~/.ssh/podman-machine-default
      $ rm -rf ~/.ssh/podman-machine-default.pub
      $ rm -rf ~/.local/share/containers
      $ rm -rf ~/.config/containers
      ```

1. Reinstall Podman using brew:

   ```shell-session
   $ brew install podman
   ```

1. Install bunzip2:

   ```shell-session
   $ brew install bzip2
   ```

1. Install QEMU 8.2.0 to `/opt/homebrew/Cellar/qemu/8.2.0`:

   ```shell-session
   $ curl -sL https://github.com/AkihiroSuda/qemu/raw/704f7cad5105246822686f65765ab92045f71a3b/pc-bios/edk2-aarch64-code.fd.bz2 | bunzip2 > /opt/homebrew/Cellar/qemu/8.2.0/share/qemu/edk2-aarch64-code.fd
   ```

1. Install patched EDK2.
   Download [EDK2](https://github.com/lima-vm/edk2-patched.tmp/releases/download/edk2-stable202311%2Blima.0/edk2-aarch64-code.fd.gz) from [lima-vm/edk2-patched.tmp/releases](https://github.com/lima-vm/edk2-patched.tmp/releases).

1. Init podman machine.

1. Find QEMU configuration directory to define _`qemu-config-directory`_ in next step:

   ```shell-session
   $ podman machine info | grep MachineConfigDir

   ```

1. Update podman machine config json:

   ```shell-session
   $ sed -i 's@file=.\*edk2-aarch64-code.fd@file=/path/to/downloaded/edk2-aarch64-code.fd@g' qemu-config-directory/podman-machine-default.json
   ```

1. Start Podman machine.

#### Additional resources

- [Issue #20776](https://github.com/containers/podman/issues/20776)
