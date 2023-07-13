---
sidebar_position: 30
---

# Troubleshooting Podman on macOS

You can find here troubleshooting help for issues specific to macOS.

### Podman machine on Apple Silicon

#### Issue

If you are using an Apple Silicon and brew, you might have the following error when starting Podman from Podman Desktop:

```shell-session
Error: qemu exited unexpectedly with exit code 1, stderr: qemu-system-x86_64: invalid accelerator hvf
qemu-system-x86_64: falling back to tcg
qemu-system-x86_64: unable to find CPU model 'host'
```

#### Explanation

Podman machine is running in a `x86_64` process and it might be due to a dual install of `homebrew`: one for `x86_64` and one for `arm64`.

#### Solution

1. Uninstall your `x86_64` Podman machine by using one of these methods:

   - Uninstall Podman machine on your `x86_64` brew install, from a terminal running under Rosetta:

     ```shell-session
     $ brew uninstall podman-machine
     ```

   - Most brew recipe have now `arm64` support.
     Therefore, uninstall brew `x86_64`.
     Follow [these instructions](https://github.com/homebrew/install#uninstall-homebrew) from a terminal running under Rosetta.

1. Run a terminal in native mode (default) and install Podman machine.

   ```shell-session
   $ brew install podman-machine
   ```

1. Delete your Podman machine virtual machines.

   ```shell-session
   $ podman machine rm podman-machine-default
   ```

1. Create a Podman machine:

   ```shell-session
   $ podman machine init
   ```
