---
sidebar_position: 1
title: Writing 
description: Writing my first extension
tags: [podman-desktop, extension, writing]
keywords: [podman desktop, extension, writing]
---

# Writing a Podman Desktop extension

Podman Desktop extensions rely on JavaScript or TypeScript.

Extensions are self-contained.
All runtime dependencies are inside the final binary.

## Initializing the Node.js project

Write the extension metadata in a `package.json` file.

#### Procedure

1. Create and edit a `package.json` file.

   ```json
   {
   }
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

* Complete `package.json` example:

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

## Writing the extension code

Extension activates by launching the `activate` function of the main file.

### Entry point

The extension entry point (`main` entry in `package.json` file) might expose two functions:

1. (Mandatory) `activate`: activation function.

1. (Optional) `deactivate`: deactivation function.

The signature of the function can be:

* Synchronous

   ```typescript
   export function activate(): void
   ```

* Asynchronous

   ```typescript
   export async function activate(): Promise<void>
   ```

The `activate` function receives an optional extension context, allowing it to register disposable resources

```typescript
import * as podmanDesktopAPI from '@podman-desktop/api';
export async function activate(extensionContext: podmanDesktopAPI.ExtensionContext): Promise<void> {
}
```

### Register the command and the callback

```typescript
import * as podmanDesktopAPI from '@podman-desktop/api';
export async function activate(extensionContext: podmanDesktopAPI.ExtensionContext): Promise<void> {

  // register the command referenced in package.json file
  const myFirstCommand = extensionApi.commands.registerCommand('my.first.command', async () => {
    
    // display a choice to the user for selecting some values
    const result = await extensionApi.window.showQuickPick(['un', 'deux', 'trois'], {
      canPickMany: true, // user can select more than one choice
    });

    // display an information message with the user choice
    await extensionApi.window.showInformationMessage(`The choice was: ${result}`);
  });

    // create an item in the status bar to run our command
    // it will stick on the left of the status bar
  const item = extensionApi.window.createStatusBarItem(extensionApi.StatusBarAlignLeft, 100);
  item.text = 'My first command';
  item.command = 'my.first.command';
  item.show();

  // register disposable resources to it's removed when we deactivte the extension
  extensionContext.subscriptions.push(myFirstCommand);
  extensionContext.subscriptions.push(item);

}
```

At this stage, the extension compiles and produces the output in `dist` folder for example.

** Note: **
Note: Using `Rollup`, `Webpack` or any other packer is helping to shrink the size of the artifact.

#### Next steps

* [Publish extension](../extensions/publish)
