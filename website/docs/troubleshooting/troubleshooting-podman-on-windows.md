---
sidebar_position: 20
---

# Troubleshooting Podman on Windows

### Fixing corrupted Podman Machine in Windows

If at all you are not able to stop your Podman Machine, you will find such an error in the Logs-
`Error: Error stopping sysd: exit status 0`

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

## The terminal session attaches to Podman Desktop when launching it from the command line in Windows

#### Issue

When you start Podman Desktop from the command line in Windows the terminal session attaches to it. You cannot quit the terminal because it will kill Podman Desktop as well.

#### Solution

Set the environment variable `ELECTRON_NO_ATTACH_CONSOLE` to true before launching Podman Desktop.
