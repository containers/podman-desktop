---
sidebar_position: 2
title: Writing 
description: Writing a Podman Desktop extension
tags: [podman-desktop, extension, writing]
keywords: [podman desktop, extension, writing]
---

# Writing a Podman Desktop extension entry point

Write the extension features.

#### Prerequisites

* JavaScript or TypeScript
* [Podman Desktop extension metadata](metadata)

#### Procedure

1. Create and edit a `dist/extension.js` file.

1. Import the Podman Desktop API

   ```typescript
   import * as podmanDesktopAPI from '@podman-desktop/api';
   ```

1. Expose the `activate` function to call on activation.

   The signature of the function can be:

   * Synchronous

     ```typescript
     export function activate(): void
     ```

   * Asynchronous

     ```typescript
     export async function activate(): Promise<void>
     ```

1. (Optional) Add an extension context to the `activate` function enabling the extension to register disposable resources:

   ```typescript
   export async function activate(extensionContext: podmanDesktopAPI.ExtensionContext): Promise<void> {
   }
   ```

1. Register the command and the callback

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

1. (Optional) Expose the `deactivate` function to call on deactivation.

   The signature of the function can be:

   * Synchronous

     ```typescript
     export function deactivate(): void
     ```

   * Asynchronous

     ```typescript
     export async function deactivate(): Promise<void>
     ```

#### Verification

* The extension compiles and produces the output in the `dist` folder.

* All runtime dependencies are inside the final binary.

#### Additional resources

* Consider a packer such as [Rollup](https://rollupjs.org) or [Webpack](https://webpack.js.org) to shrink the size of the artifact.

#### Next steps

* [Publishing a Podman Desktop extension](publish)
