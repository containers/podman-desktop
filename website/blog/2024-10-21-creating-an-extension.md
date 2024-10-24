---
title: Introduction to Podman Desktop extensions
description: Learn how to create and customize your own extension for Podman Desktop
slug: extensions-introduction
authors: [cdrage]
tags: [podman-desktop, release, podman, extension, plugin]
hide_table_of_contents: false
---

![programming](img/creating-an-extension/programming.png)

# How to create your first extension

Extensions are a powerful tool to customize and extend the functionality of Podman Desktop. Whether you want to add new container management features, streamline current workflows, or create custom UI elements specific to your tech stack, building extensions allows you to tailor the Podman Desktop experience to your specific needs. 

In this guide, we'll introduce how you can build your own Podman Desktop extension, with links to detailed documentation that covers each part of the process.

## Introduction to extensions

Extensions are abundant in Podman Desktop and can be found in the **Extensions -> Catalog** section.

![extension catalog](img/podman-desktop-release-1.10/extension-catalog.png)

Each extension expands on Podman Desktop, such as providing [Kubernetes development clusters with Minikube](https://github.com/containers/podman-desktop-extension-minikube) or even [analyzing your image layers](https://github.com/containers/podman-desktop-extension-layers-explorer).

Below is an example of the [layers explorer extension](https://github.com/containers/podman-desktop-extension-layers-explorer) and how it integrates into Podman Desktop:

![layers_explorer](img/creating-an-extension/layers_explorer.png)

## Getting started with your project

The first step in creating your extension is setting up the project environment. To learn how to configure the project and add basic components, check out the **[Templates for creating an extension](/docs/extensions/templates)** guide, which walks you through initializing your project from an official template.

## Adding UI components

One of the most common tasks when creating an extension is adding a user interface. Whether it’s adding buttons, panels, or icons, UI components help make your extension more interactive and accessible. Adding a UI component is totally optional and an extension can be ran without UI components. Learn more about this in the **[Adding UI components](/docs/extensions/developing/adding-ui-components)** documentation, where you’ll find instructions on creating and integrating components into the application’s UI.

### Working with icons

Icons are a great way to make your extension more visually unique. You can learn how to add and style custom icons by following the **[Adding icons](/docs/extensions/developing/adding-icons)** documentation.

Below is an example of how the [bootc extension](https://github.com/containers/podman-desktop-extension-bootc) added icons to the image list within Podman Desktop:

![icons](img/creating-an-extension/icons.png)

### Menus and navigation

Extensions often integrate with existing menus and navigation to offer users easy access to new commands and features. If you want to add items to the context menu, explore the **[Menu configuration](/docs/extensions/developing/menu)** documentation, which explains how to add commands to menus and control when they are displayed using When Clauses.

Below is an example of how the [bootc extension](https://github.com/containers/podman-desktop-extension-bootc) added a new menu command to image list:

![menus](img/creating-an-extension/menus.png)

## Adding and configuring commands

Commands are the backbone of most extensions, allowing users to interact with the application and trigger specific actions. 

If you need to define and register custom commands, the **[Commands](/docs/extensions/developing/commands)** guide will show you how to create commands that respond to user actions or input, and tie them into your extension’s workflow.

You can also configure these commands to appear in different contexts. Check out the **[When clause Contexts](/docs/extensions/developing/when-clause-context)** documentation to learn more about restricting commands to specific scenarios.

Commands are heavily influenced by [VS Code commands](https://code.visualstudio.com/api/extension-guides/command) and can be configured similarly. See our [commands guide](/docs/extensions/developing/commands) for more information.

## Setting up onboarding workflows

Creating a smooth onboarding experience is essential to help users get started with your extension. This includes steps for CLI binary installations or other initial setup values.

You can provide guidance, tutorials, or initial setup steps using the **[Onboarding workflow](/docs/extensions/developing/onboarding-workflow)** guide.

Below is an example of how the [built-in compose extension](https://github.com/containers/podman-desktop/tree/main/extensions/compose) adds onboarding for the compose CLI binary installation:

![compose](img/creating-an-extension/compose.png)

## Configuration settings

Once you’ve built your components and commands, you may want to setup configuration settings for advanced usage of your extension.

The **[Configuration](/docs/extensions/developing/config)** documentation outlines the configuration file structure and how to link everything together to use user-specific values.

## Publishing your extension

Publishing enables users to install your extension, you can compile your extension into a container image for users to easily consume. Follow the **[Publishing](/docs/extensions/publish)** guide to learn how to distribute your extension.

## Conclusion

Creating an extension opens up endless possibilities to customize Podman Desktop to your specific needs.

It is also easy to package and publish your extension for others to use.

Have fun exploring our documentation on how to create an extension and happy coding!