---
sidebar_position: 10
---

# Troubleshooting on Windows

You can find here troubleshooting help for issues specific to Windows.

## Deleting a corrupted Podman Machine

#### Issue

1. You are not able to stop your Podman Machine.

   ```
   $podman machine stop
   ```

2. The Logs contain this error:

   ```
   Error: Error stopping sysd: exit status 1
   ```

#### Workaround

1. To display the active WSL distribution list: in the terminal, run:

   ```sh
   > wsl --list
   ```

1. The command returns the list of active WSL distributions. Identify your Podman Machine in the list, such as `podman-machine-default`.

1. To stop, unregister, and uninstall your Podman Machine: in the terminal, replace `podman-machine-default` by your Podman machine name, and run:

   ```sh
   > wsl --unregister podman-machine-default
   ```

#### Additional resources

- https://learn.microsoft.com/en-us/windows/wsl/basic-commands#unregister-or-uninstall-a-linux-distribution

## The terminal session attaches to Podman Desktop when launching it from the command line

#### Issue

1. When you start Podman Desktop from the command line in Windows the terminal session attaches to it.
1. When you quit the terminal, it kills Podman Desktop.

#### Solution

- Set the environment variable `ELECTRON_NO_ATTACH_CONSOLE` to true before launching Podman Desktop.
