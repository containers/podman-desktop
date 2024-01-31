---
sidebar_position: 1
title: Writing
description: Writing a Podman Desktop extension
tags: [podman-desktop, extension, writing]
keywords: [podman desktop, extension, writing]
---

# Writing a Podman Desktop extension

To write a Podman Desktop extension, start a Node.js or TypeScript project calling the Podman Desktop API, and ensure all runtime dependencies are inside the final binary.

## Initializing a Podman Desktop extension

Write the Podman Desktop extension Node.js package metadata.

#### Prerequisites

- JavaScript or TypeScript

#### Procedure

1. Create and edit a `package.json` file.

   ```json
   {}
   ```

1. Add TypeScript and Podman Desktop API to the development dependencies:

   ```json lines
    "devDependencies": {
      "@podman-desktop/api": "latest",
      "typescript": "latest"
    },
   ```

1. Add the required metadata:

   ```json lines
     "name": "my-extension",
     "displayName": "My Hello World extension",
     "description": "How to write my first extension",
     "version": "0.0.1",
     "icon": "icon.png",
     "publisher": "benoitf",
   ```

1. Add the Podman Desktop version that might run this extension:

   ```json lines
     "engines": {
       "podman-desktop": "latest"
     },
   ```

1. Add the main entry point:

   ```json lines
    "main": "./dist/extension.js"
   ```

1. Add a Hello World command contribution

   ```json lines
     "contributes": {
       "commands": [
        {
          "command": "my.first.command",
          "title": "My First Extension: Hello World"
        }
      ]
     }
   ```

1. Add an `icon.png` file to the project.

#### Verification

- Full `package.json` example:

  ```json
  {
    "devDependencies": {
      "@podman-desktop/api": "latest",
      "typescript": "latest"
    },
    "name": "my-extension",
    "displayName": "My Hello World extension",
    "description": "How to write my first extension",
    "version": "0.0.1",
    "icon": "icon.png",
    "publisher": "benoitf",
    "engines": {
      "podman-desktop": "latest"
    },
    "main": "./dist/extension.js",
    "contributes": {
      "commands": [
        {
          "command": "my.first.command",
          "title": "My First Extension: Hello World"
        }
      ]
    }
  }
  ```

## Writing a Podman Desktop extension entry point

Write the extension features.

#### Prerequisites

- JavaScript or TypeScript

#### Procedure

1. Create and edit a `dist/extension.js` file.

1. Import the Podman Desktop API

   ```typescript
   import * as podmanDesktopAPI from '@podman-desktop/api';
   ```

1. Expose the `activate` function to call on activation.

   The signature of the function can be:

   - Synchronous

     ```typescript
     export function activate(): void;
     ```

   - Asynchronous

     ```typescript
     export async function activate(): Promise<void>;
     ```

1. (Optional) Add an extension context to the `activate` function enabling the extension to register disposable resources:

   ```typescript
   export async function activate(extensionContext: podmanDesktopAPI.ExtensionContext): Promise<void> {}
   ```

1. Register the command and the callback

   ```typescript
   import * as podmanDesktopAPI from '@podman-desktop/api';
   export async function activate(extensionContext: podmanDesktopAPI.ExtensionContext): Promise<void> {
     // register the command referenced in package.json file
     const myFirstCommand = podmanDesktopAPI.commands.registerCommand('my.first.command', async () => {
       // display a choice to the user for selecting some values
       const result = await podmanDesktopAPI.window.showQuickPick(['un', 'deux', 'trois'], {
         canPickMany: true, // user can select more than one choice
       });

       // display an information message with the user choice
       await podmanDesktopAPI.window.showInformationMessage(`The choice was: ${result}`);
     });

     // create an item in the status bar to run our command
     // it will stick on the left of the status bar
     const item = podmanDesktopAPI.window.createStatusBarItem(podmanDesktopAPI.StatusBarAlignLeft, 100);
     item.text = 'My first command';
     item.command = 'my.first.command';
     item.show();

     // register disposable resources to it's removed when we deactivte the extension
     extensionContext.subscriptions.push(myFirstCommand);
     extensionContext.subscriptions.push(item);
   }
   ```

1. (Optional) Expose the `deactivate` function to call on deactivation.

   The signature of the function can be:

   - Synchronous

     ```typescript
     export function deactivate(): void;
     ```

   - Asynchronous

     ```typescript
     export async function deactivate(): Promise<void>;
     ```

#### Verification

- The extension compiles and produces the output in the `dist` folder.

- All runtime dependencies are inside the final binary.

## Developing a Podman Desktop extension

#### Prerequisites

- JavaScript or TypeScript
- A clone of the Podman Desktop repository

#### Procedure

1. To start Podman Desktop with your extension loaded, run:

```
yarn watch --extension-folder /path/to/your/extension
```

#### Additional resources

- Consider a packer such as [Rollup](https://rollupjs.org) or [Webpack](https://webpack.js.org) to shrink the size of the artifact.

#### Next steps

- [Publishing a Podman Desktop extension](/docs/extensions/publish)
