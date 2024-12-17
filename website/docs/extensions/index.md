---
sidebar_position: 110
title: Extensions
description: Installing, developing, or publishing extensions.
keywords: [podman desktop, podman, extension]
tags: [podman-desktop-extensions, building-an-extension]
---

# Podman Desktop extensions

Extensions are designed to be modular and easily pluggable into Podman Desktop. They allow you to use and manipulate a wide range of Podman Desktop functionalities [via our API](/api). Not only can you customize every component of Podman Desktop, but you can also extend its functionality with these extensions.

With extensions, you can add:

- Support for container engines, such as Podman or Docker.
- Virtual machine integrations, such as Lima.
- Podman Desktop extension points, including tray icon menus, status bar items, icons, menus, and commands.
- Integration with third-party tools, such as Kind or Compose.

## Architecture

Below is an example of the architecture for the "Podman" extension that integrates with Podman Desktop:

![architecture](img/architecture.png)

Each extension is isolated and communicates entirely through the Podman Desktop API, ensuring modularity and extensibility for Podman Desktop.

## What can a Podman Desktop extension do?

Here are some examples of what you can achieve with the Podman Desktop extension API:

- [Create your own onboarding workflow.](/docs/extensions/developing/onboarding-workflow)
- [Add non-native Podman Desktop commands.](/docs/extensions/developing/commands)
- [Create configuration settings for your extension.](/docs/extensions/developing/config)
- [Add menus to areas, such as pushing images.](/docs/extensions/developing/menu)

The possibilities are endless. You can leverage [our API](/api) to expand your extension's capabilities even further.

## How to build an extension

To help you get started, we've provided templates ranging from a minimal "Hello World" example to a full web-view extension.

Here are some examples from [our templates documentation](/docs/extensions/templates):

- [Basic "Hello World" example.](https://github.com/podman-desktop/extension-template-minimal) 
- [Simple webview template.](https://github.com/podman-desktop/extension-template-webview)
- [Full-stack webview template.](https://github.com/podman-desktop/extension-template-full)

Have questions or need assistance? Join our community on Discord for support!

## Next Steps

- [Writing a Podman Desktop extension entry point](/docs/extensions/developing)
- [Publishing a Podman Desktop extension](/docs/extensions/publish)
- [Installing a Podman Desktop extension](/docs/extensions/install)
