# Extensions

Podman Desktop is organized so that you can modularly add new functionality in the form of "extensions" as well as the corresponding `extension-api`. This allows you to communicate with Podman Desktop without having to know the internal-workings. You look for the API call and Podman Desktop will do the rest.

Bundled extensions are located in the `/extensions` folder.

#### Creating a new extension

When creating a new extension, import the extension API: `import * as extensionApi from '@podman-desktop/api';` 

All functionality with Podman Desktop is communicated through this API including registering the new extension. The API is located [here](https://github.com/containers/podman-desktop/blob/main/packages/extension-api/src/extension-api.d.ts).

When loading an extension, Podman Desktop will:
1. Search and load the JavaScript file specified in `main` entry of the `package.json` file in the extension directory (typically `extension.js`).
2. Run the exported `activate` function.

When unloading an extension, Podman Desktop will:
1. Run the exported `deactivate` function.
2. Dispose of any resources that have been added to `extensionContext.subscriptions`, see `deactivateExtension` in [extension-loader.ts](https://github.com/containers/podman-desktop/blob/main/packages/main/src/plugin/extension-loader.ts).

#### Example boilerplate code

This is an example `extensions/foobar/src/extensions.ts` file with the basic `activate ` and `deactivate` functionality:

```ts
import * as extensionApi from '@podman-desktop/api';


// Activate the extension asynchronously
export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {

  // Create a provider with an example name, ID and icon
  const provider = extensionApi.provider.createProvider({
    name: 'foobar',
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
  console.log('stopping foobar extension');
}
```

### Provider status

Podman Desktop runs each provider via series of statuses from [extension-api](https://github.com/containers/podman-desktop/blob/main/packages/extension-api/src/extension-api.d.ts).

#### `ProviderStatus`

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

#### `ProviderConnectionStatus`

```ts
export type ProviderConnectionStatus = 'started' | 'stopped' | 'starting' | 'stopping' | 'unknown';
```

> **_NOTE:_** The `unknown` status is unique as it will not show in the extension section of Podman Desktop, it will also not be accessible via API calls. Uknown statuses typically happen when Podman Desktop is unable to load the extension. 

`ProviderConnectionStatus` is the main "Lifecycle" of your extension. The status is updated by automatically by Podman Desktop and reflected within the provider.

Upon a successful start up via the `activate` function within your extension, `ProviderConnectionStatus` will be reflected as 'started'. 

`ProviderConnectionStatus` statuses are used in two areas, [extension-loader.ts](https://github.com/containers/podman-desktop/blob/main/packages/main/src/plugin/extension-loader.ts) and [tray-menu.ts](https://github.com/containers/podman-desktop/blob/main/packages/main/src/tray-menu.ts):
* `extension-loader.ts`: Attempts to load the extension and sets the status accordingly (either `started`, `stopped`, `starting` or `stopping`). If an unknown error has occured, the status is set to `unknown`. `extension-loader.ts` also sends an API call to Podman Desktop to update the UI of the extension.
* `tray-menu.ts`: If `extensionApi.tray.registerMenuItem(item);` API call has been used, a tray menu of the extension will be created. When created, Podman Desktop will use the `ProviderConnectionStatus` to indicate the status within the tray menu.

#### Expanding the `extension-api` API

Sometimes you'll need to add new functionality to the API in order to make an internal change within Podman Desktop. An example would be a new UI/UX component that happens within the renderer, you'd need to expand the API in order to make that change to Podman Desktop's inner-workings.

In this example, we'll add a new function to simply display: "hello world" in the console.

1. Add the new function to `/packages/extension-api/src/extension-api.d.ts`, under a namespace. This will make it accessible within the API when it's being called within your extension:

```ts
  export namespace foobar {
    // ...
    export function hello(input: string): void;
  }
```

2. The `packages/main/src/plugin/extension-loader.ts` acts as an extension loader that defines all the actions needed by the API. Modify it to add the main functionality of `hello()` under the `foobar` namespace const:

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

3. The above code won't work until we've created the class! So let's create a `packages/main/src/plugin/foobar-client.ts` file with the functionality:

```ts
export class FoobarClient {
  hello(input: string) {
    console.log("hello " + input);
  }
}
```

4. Last step! Call the new API call to the extension you are implementing from your extension:

```ts
export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {

  // Define the provider
  const provider = extensionApi.provider.createProvider({
    name: 'foobar',
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
  extensionContext.foobar.hello("world");
}
```

