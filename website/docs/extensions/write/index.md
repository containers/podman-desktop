---
sidebar_position: 1
title: Writing
description: Writing my first extension
tags: [podman-desktop, extension, writing]
keywords: [podman desktop, extension, writing]
---

# Writing your first extension

Podman Desktop extensions rely on `JavaScript` or `TypeScript`.

Extensions are self-contained, all runtime dependencies are inside the final binary.

#### Scaffold the project

1. setup a Node.js project with `TypeScript`. Use for example `npm init` command.

1. Bring the development dependency to Podman Desktop API. It allows to import the API and register the contributions.

  Note that it is a dependency that brings only the definition of the API. It will not fetch any Podman Desktop internals.

  ```json
    "devDependencies": {
      "@podman-desktop/api": "latest",
    }
  ```

1. Setup the required metadata for the extension

  ```json
  {
    "name": "my-extension",
    "displayName": "My Hello World extension",
    "description": "How to write my first extension",
    "version": "0.0.1",
    "icon": "icon.png",
    "publisher": "benoitf",
    "engines": {
      "podman-desktop": "latest"
    }
  }
  ```

  In engine section, it describes the version of Podman Desktop that runs this extension.

1. Includes the main entry point of the extension

  ```json
    "main": "./dist/extension.js",
  ```

1. Add Hello World command contribution

  ```json
    "contributes": {
      "commands": [
        {
          "command": "my.first.command",
          "title": "My First Extension: Hello World"
        }
      ]
    },
  ```

#### Writing the codebase of the extension

package.json describes the metadata of the extension. Extension activates by launching the `activate` function of the main file.

##### Entry point
Entrypoint of the extension (`main` entry in `package.json` file) needs to expose two functions.

One is for activation (`activate`), one for deactivation (`deactivate`). This one is optional.

Signature of the function can be synchronous

```typescript
export function activate(): void
```

or asynchronous

```typescript
export async function activate(): Promise<void>
```

Activate function receive an optional extension context, allowing to register disposable resources

```typescript
import * as podmanDesktopAPI from '@podman-desktop/api';
export async function activate(extensionContext: podmanDesktopAPI.ExtensionContext): Promise<void> {
}
```

##### Register the command and the callback

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

At this stage, extension compiles and produces the output in `dist` folder for example.

** Note: **
Note: Using `Rollup`, `Webpack` or any other packer is helping to shrink the size of the artifact.

#### Next steps

* [Publish extension](../extensions/publish)
