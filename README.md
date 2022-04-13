# Podman Desktop
Manage different container engines from a single UI and tray icon

<p align="center">
  <img alt="Container Desktop" src="https://raw.githubusercontent.com/containers/desktop/media/screenshot.png">
</p>


- [**Overview**](#overview)
- [**Download**](#download)
- [**Roadmap**](#roadmap)
- [**Contributing**](#contributing)
- [**Communication**](#communication)
- [**Code of Conduct**](#code-of-conduct)
- [**License**](#license)

## Overview
This tool allows to browse, manage lifecycle of containers, inspect containers, images from different container engines.

It includes a tray icon support.
 
It can connect to multiple engines at the same time and provides an unified interface.

Specific runtime plug-ins provides support for different container engine.

There are plug-ins to handle [Podman container engine](https://github.com/containers/podman), [crc](https://github.com/code-ready/crc), [Podman Lima machines](https://github.com/lima-vm/lima), Docker, etc.

## Download

Find latest binaries for Windows, MacOS and Linux on https://github.com/containers/podman-desktop/releases/

There are `next` builds produced after each commit in main branch.

⚠️ For now the binaries are not signed.

For macOS it may require to perform this additional step: `xattr -r -d com.apple.quarantine container-desktop.app`

## Roadmap
Upcoming milestones are defined with GitHub issue tracker.

Track milestones at https://github.com/containers/podman-desktop/milestones

## Contributing
If you are interested in fixing issues and contributing directly to the desktop code:
- :bug: [File bugs or feature requests](https://github.com/containers/podman-desktop/issues/new/choose)
- :checkered_flag: [Contributing guide](./CONTRIBUTING.md)
- :ok_hand: [Review or contribute pull requests](https://github.com/containers/podman-desktop/pulls)

## Communication

For bugs/feature requests please [file issues](https://github.com/containers/podman-desktop/issues/new/choose)

Discussions are possible using Github Discussions https://github.com/containers/podman-desktop/discussions/

## Code of Conduct

This project is using the [Containers Community Code of Conduct](https://github.com/containers/common/blob/main/CODE-OF-CONDUCT.md)

## License

Licensed under the [Apache 2.0](LICENSE) license.
