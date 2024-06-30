---
sidebar_position: 2
title: Developing
description: Developing a Podman Desktop extension
tags: [podman-desktop, extension, writing]
keywords: [podman desktop, extension, writing]
---

# Developing a Podman Desktop extension

Podman Desktop is organized so that you can modularly add new functionality in the form of "extensions" as well as the corresponding extension-api. This allows you to communicate with Podman Desktop without having to know the internal-workings. You look for the API call and Podman Desktop will do the rest.

It is recommended that an extension is written in **TypeScript** for typechecking, but extensions CAN be written in **JavaScript**.

Most extensions are externally loaded, however, we also dog-food our own API by loading them as [internal extensions](https://github.com/containers/podman-desktop/tree/main/extensions) that use the same API. These internal maintained extensions can be used as an example and basis of how to build an externally-loaded extension.

## Overview of creating a new extension

We try to simplify extension creation as much as possible by utilizing `package.json` as well as keeping activations simplistic within the extension by only providing two entrypoints: `activate()` and `deactivate()` from within the extension.

All functionality with Podman Desktop is also communicated entirely through the `extension-api` which is loaded as `import * as extensionApi from '@podman-desktop/api';`. The API code is located [here](https://github.com/containers/podman-desktop/blob/main/packages/extension-api/src/extension-api.d.ts) while the website representation of the code is located [here](https://podman-desktop.io/api).

### Activating

When activating an extension, Podman Desktop will:

1. Search and load the JavaScript file specified in `main` entry of the `package.json` file in the extension directory (typically `extension.js`).
2. Run the exported `activate` function.

### Deactivating

When deactivating an extension, Podman Desktop will:

1. Run the (optional) exported `deactivate` function.
2. Dispose of any resources that have been added to `extensionContext.subscriptions`, see `deactivateExtension` in [extension-loader.ts](https://github.com/containers/podman-desktop/blob/main/packages/main/src/plugin/extension-loader.ts).

### Example boilerplate code

This is an example `extensions/foobar/src/extensions.ts` file with the basic `activate` and `deactivate` functionality, provided that you already have a `package.json` created as well:

```ts
import * as extensionApi from '@podman-desktop/api';

// Activate the extension asynchronously
export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // Create a provider with an example name, ID and icon
  const provider = extensionApi.provider.createProvider({
    name: 'FooBar',
    id: 'foobar',
    status: 'unknown',
    images: {
      icon: './icon.png',
      logo: './icon.png',
    },
  });

  // Push the new provider to Podman Desktop
  extensionContext.subscriptions.push(provider);
}

// Deactivate the extension
export function deactivate(): void {
  console.log('stopping FooBar extension');
}
```

### Interacting with the UI

The extension "hooks" into the Podman Desktop UI by different means:

- by registering the extension as a specific provider (authentication, registry, kubernetes, containers, cli tool, etc),
- by registering to specific events (with functions starting with `onDid...`),
- by adding entries to menus (tray menu, status bar, ),
- by adding fields to the configuration panel,
- by watching files in the filesystem.

When the extension code is accessed through these different registrations, the extension can use utility functions provided by the API:

- to get values of configuraton fields,
- to interact with the user, through input boxes, quick picks,
- to display information/warning/error messages and notifications to the user,
- to get information about the environment (OS, telemetry, system clipboard),
- to execute process in the system,
- to send data to the telemetry,
- to set data in the context, which is propagated in the UI.

## Creating an extension

### Initializing an extension

We use `package.json` as much as possible. We start by writing our first `package.json`

#### Prerequisites

- JavaScript or TypeScript

#### Procedure

1. Initialize a `package.json` file.

   ```json
   {}
   ```

1. Add TypeScript and Podman Desktop API to the development dependencies:

   ```json lines
    "devDependencies": {
      "@podman-desktop/api": "latest",
      "typescript": "latest",
      "vite": "latest"
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
      "typescript": "latest",
      "vite": "latest"
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
    "scripts": {
      "build": "vite build",
      "test": "vitest run --coverage",
      "test:watch": "vitest watch --coverage",
      "watch": "vite build --watch"
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

### Writing an extension entry point

Write the extension features.

#### Prerequisites

- JavaScript or TypeScript

#### Procedure

1. Create and edit a `src/extension.ts` file.

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

Keep in mind that the above example is not a full representation of every functionality an extension can be used for. Examples such as creating a new provider, new commands, expanding the internal Podman Desktop functionality can also be implemented. See our [API documnentation](https://podman-desktop.io/api) for more information.

### Build dependencies

This examples uses TypeScript and Vite to build and the following files should be in the root of your extension.

Create a file named `tsconfig.json` with the following content:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "lib": ["ES2017"],
    "sourceMap": true,
    "rootDir": "src",
    "outDir": "dist",
    "target": "esnext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src", "types/*.d.ts"]
}
```

Create a file named `vite.config.js` with the following content:

```javascript
/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { join } from 'path';
import { builtinModules } from 'module';

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
  },
  build: {
    sourcemap: 'inline',
    target: 'esnext',
    outDir: 'dist',
    assetsDir: '.',
    minify: process.env.MODE === 'production' ? 'esbuild' : false,
    lib: {
      entry: 'src/extension.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['@podman-desktop/api', ...builtinModules.flatMap(p => [p, `node:${p}`])],
      output: {
        entryFileNames: '[name].js',
      },
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
};

export default config;
```

#### Verification

- The extension compiles and produces the output in the `dist` folder.

- All runtime dependencies are inside the final binary.

## Testing and running an extension

#### Prerequisites

- JavaScript or TypeScript
- A clone of the [Podman Desktop](https://github.com/containers/podman-desktop) repository

#### Procedure

1. To start Podman Desktop with your extension loaded, run the following from your clone of the Podman Desktop repo:

```shell
yarn watch --extension-folder /path/to/your/extension
```

## Expanding your extension

Below is documentation and/or "boiler-plate" code that can help expand your extension.

### Using `ProviderStatus`

Podman Desktop runs each provider via series of statuses from [extension-api](https://github.com/containers/podman-desktop/blob/main/packages/extension-api/src/extension-api.d.ts).

```ts
export type ProviderStatus =
  | 'not-installed'
  | 'installed'
  | 'configured'
  | 'ready'
  | 'started'
  | 'stopped'
  | 'starting'
  | 'stopping'
  | 'error'
  | 'unknown';
```

`ProviderStatus` supplies information to the main Provider page detailing whether or not that Provider is installed, ready, started, stopped, etc.

This can be updated throughout your extension by calling for example: `provider.updateStatus('installed')`. Podman Desktop will show the status on the main screen.

> **_NOTE:_** ProviderStatus is for information purposes only and can be used from within the extension to keep track if `activate()` and `deactivate()` are working correctly.

### Using `ProviderConnectionStatus`

```ts
export type ProviderConnectionStatus = 'started' | 'stopped' | 'starting' | 'stopping' | 'unknown';
```

> **_NOTE:_** The `unknown` status is unique as it will not show in the extension section of Podman Desktop, it will also not be accessible via API calls. Unknown statuses typically happen when Podman Desktop is unable to load the extension.

`ProviderConnectionStatus` is the main "Lifecycle" of your extension. The status is updated automatically by Podman Desktop and reflected within the provider.

Upon a successful start up via the `activate` function within your extension, `ProviderConnectionStatus` will be reflected as 'started'.

`ProviderConnectionStatus` statuses are used in two areas, [extension-loader.ts](https://github.com/containers/podman-desktop/blob/main/packages/main/src/plugin/extension-loader.ts) and [tray-menu.ts](https://github.com/containers/podman-desktop/blob/main/packages/main/src/tray-menu.ts):

- `extension-loader.ts`: Attempts to load the extension and sets the status accordingly (either `started`, `stopped`, `starting` or `stopping`). If an unknown error has occurred, the status is set to `unknown`. `extension-loader.ts` also sends an API call to Podman Desktop to update the UI of the extension.
- `tray-menu.ts`: If `extensionApi.tray.registerMenuItem(item);` API call has been used, a tray menu of the extension will be created. When created, Podman Desktop will use the `ProviderConnectionStatus` to indicate the status within the tray menu.

### Adding commands

## Commands

Declare commands using `contributes` section of package.json file.

```json
 "contributes": {
    "commands": [
      {
        "command": "my.command",
        "title": "This is my command",
        "category": "Optional category to prefix title",
        "enablement": "myProperty === myValue"
      },
    ],
 }
```

If optional `enablement` property evaluates to false, command palette will not display this command.

To register the callback of the command, use the following code:

```ts
import * as extensionApi from '@podman-desktop/api';

extensionContext.subscriptions.push(extensionApi.commands.registerCommand('my.command', async () => {
    // callback of your command
    await extensionApi.window.showInformationMessage('Clicked on my command');
});
);
```

### Expanding the `extension-api` API

Sometimes you'll need to add new functionality to the API in order to make an internal change within Podman Desktop. An example would be a new UI/UX component that happens within the renderer, you'd need to expand the API in order to make that change to Podman Desktop's inner-workings.

Please note that an API contribution is **subject to approval** as we want to maintain sustainability / consistency in the API. A discussion within an issue would be beneficial before writing code.

In this example, we'll add a new function to simply display: "hello world" in the console.

1. Add the new function to `/packages/extension-api/src/extension-api.d.ts`, under a namespace. This will make it accessible within the API when it's being called within your extension:

```ts
export namespace foobar {
  // ...
  export function hello(input: string): void;
}
```

2. The `packages/main/src/plugin/extension-loader.ts` acts as an extension loader that defines all the actions needed by the API. Modify it to add the main functionality of `hello()` under the `foobar` namespace const: <!-- markdownlint-disable-line MD029 -->

```ts
// It's recommended you define a class that you retrieve from a separate file
// see Podman and Kubernetes examples for implementation.

// Add the class to the constructor of the extension loader
import type { FoobarClient } from './foobar';

export class ExtensionLoader {
  // ...
  constructor(
    private foobarClient: FoobarClient,
    // ...
  ) {}
// ..
}

// Initialize the 'foobar' client
const foobarClient = this.foobarClient;

// The "containerDesktopAPI.foobar" call is the namespace you previously defined within `extension-api.d.ts`
const foobar: typeof containerDesktopAPI.foobar = {

  // Define the function that you are implementing and call the function from the class you created.
  hello(input: string): void => {
    return foobarClient.hello(input);
  },
};

// Add 'foobar' to the list of configurations being returned by `return <typeof containerDesktopAPI>`
return <typeof containerDesktopAPI>{
  foobar
};
```

3. The above code won't work until we've created the class! So let's create a `packages/main/src/plugin/foobar-client.ts` file with the functionality: <!-- markdownlint-disable-line MD029 -->

```ts
export class FoobarClient {
  hello(input: string) {
    console.log('hello ' + input);
  }
}
```

4. An instance of this class needs to be created and passed to the constructor of the `ExtensionLoader`, in `packages/main/src/plugin/index.ts`: <!-- markdownlint-disable-line MD029 -->

```ts
const foobarClient = new FoobarClient();
this.extensionLoader = new ExtensionLoader(
  /* ... */
  foobarClient,
);
```

5. In package.json you can register some setting through the configuration settings property <!-- markdownlint-disable-line MD029 -->

For example if you contribute a property named `podman.binary.path` it will display `Path` in Podman Desktop UI setting, and if you change it to `podman.binary.pathToBinary` it becomes `Path To Binary` in the title.

```ts

    "configuration": {
      "title": "Podman",
      "properties": {
        "podman.binary.path": {
          "name": "Path to Podman Binary",
          "type": "string",
          "format": "file",
          "default": "",
          "description": "Custom path to Podman binary (Default is blank)"
        },
```

6. Last step! Call the new API call to the extension you are implementing from your extension: <!-- markdownlint-disable-line MD029 -->

```ts
export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // Define the provider
  const provider = extensionApi.provider.createProvider({
    name: 'FooBar',
    id: 'foobar',
    status: 'unknown',
    images: {
      icon: './icon.png',
      logo: './icon.png',
    },
  });

  // Push the new provider to Podman Desktop
  extensionContext.subscriptions.push(provider);

  // Call the "hello world" function that'll output to the console
  extensionContext.foobar.hello('world');
}
```

## Additional resources

- Consider a packer such as [Rollup](https://rollupjs.org) or [Webpack](https://webpack.js.org) to shrink the size of the artifact.

## Next steps

- [Publishing a Podman Desktop extension](/docs/extensions/publish)
