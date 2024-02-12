---
sidebar_position: 120
title: Troubleshooting
description: How to investigate when it does not work as expected.
---

# Troubleshooting

If you cannot find your issue here or in the documentation, please fill an issue on our [repository](https://github.com/containers/podman-desktop/issues). You can also explore the [discussions](https://github.com/containers/podman-desktop/discussions) and do a search on similar issues on the [repository](https://github.com/containers/podman-desktop/issues).

## Using the **Troubleshooting** page

Podman Desktop has a **Troubleshooting** page to help identify and fix most common errors.

#### Procedure

1. To open the **Troubleshooting** page, click the **<Icon icon="fa-solid fa-lightbulb" size="lg" />** icon.
1. To test the connection to the container engine, click the **Ping** button.

   Expect a reply such as: _Responded: 79,75 (9.10ms)_.

1. To test Click the **Check containers** button.

   Expect a reply such as: _Responded: 16 containers (108.70ms)_.

1. When connection to the container engine failed, to recreate connections to the sockets, click the **Reconnect providers** button.

   Expect a reply such as: _Done in (5.00ms)_.

1. Search for errors in the **Logs** section.

#### Additional resources

- [Troubleshooting Podman](/docs/troubleshooting/troubleshooting-podman)
- [Troubleshooting Podman on Windows](/docs/troubleshooting/troubleshooting-podman-on-windows)
- [Troubleshooting Podman on macOS](/docs/troubleshooting/troubleshooting-podman-on-macos)
- [Troubleshooting Podman on Linux](/docs/troubleshooting/troubleshooting-podman-on-linux)
- [Troubleshooting OpenShift Local](/docs/troubleshooting/troubleshooting-openshift-local)
