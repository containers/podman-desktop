---
sidebar_position: 4
title: Adding icons
description: Podman Desktop and resources icons
tags: [podman-desktop, extension, writing, icons]
keywords: [podman desktop, extension, writing, icons]
---

# Adding icons

Podman Desktop allows extensions to register custom icons that can be used for resources based on certain condition defined by a [when clause](when-clause-context.md).

For example, the Kind extension register a custom icons by using the following instruction.

```json
"icons": {
  "kind-icon": {
    "description": "Kind icon",
    "default": {
      "fontPath": "kind-icon.woff2",
      "fontCharacter": "\\EA01"
    }
  }
}
```

We restrict the format to the [Web Open Font Format 2 (aka woff2)](https://www.w3.org/TR/WOFF2/) to use icons as text, to keep consistency across the UI, as the color and size is managed by Podman-Desktop.

### Creating a .woff2 file

You probably have an existing `.svg` file that you want to use, to make it possible you can use the tool [svgiconfont](https://nfroidure.github.io/svgiconfont/) made by [@nfroidure](https://twitter.com/nfroidure).

To ensure the produced `.woff2` file contains the expected characters you created from your svg file(s). You can use the tool [fontforge.org](https://fontforge.org/) to visualize it.

:::info

To find the `fontCharacter` where your icons has been saved, you can search inside the FontForge tool by the name of the svg file you used.

:::
