---
title: Menus
description: Podman Desktop menu reference
tags: [podman-desktop, extension]
keywords: [podman desktop, extension, menu]
---

# Menus

## Menu Details

This section describes how menus are integrated into the extension. These menus are configured to appear in specific parts of the user interface and are tied to commands defined in the extension.

### `package.json` Example

This example shows how to integrate a menu into the Podman Desktop extension through the `package.json` file. Here, a menu item is added under the "dashboard/image" context. Meaning that the command will appear next to the image when `selectImageId` is not in `imagePushInProgressToKind`.

```json
{
  "contributes": {
    "menus": {
      "dashboard/image": [
        {
          "command": "kind.image.move",
          "title": "Push image to Kind cluster",
          "when": "selectedImageId not in imagesPushInProgressToKind"
        }
      ]
    }
  }
}
```

### JSON Schema

```json
{
  "contributes": {
    "menus": {
      "<MenuContext>": [
        {
          "command": "string",
          "title": "string",
          "when": "string",
          "disabled": "boolean"
        }
      ]
    }
  }
}
```

#### MenuContext available

- 'dashboard/image': Item menu on image actions
- 'dashboard/container': Item menu on container actions
- 'dashboard/pod': Item menu on pod actions
- 'dashboard/compose': Item menu on compose actions

### Verification

To verify that your menus are functioning correctly:

1. Navigate to the dashboard within Podman Desktop.
2. Right-click on an image to see the context menu.
3. Select "Push image to Kind cluster" and verify that the action completes successfully, ensuring no errors occur during the operation.
