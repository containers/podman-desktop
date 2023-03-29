# Contributing to Podman Desktop

<p align="center">
  <img alt="Podman Desktop" src="https://raw.githubusercontent.com/containers/podman-desktop/media/screenshot.png">
</p>

We'd love to have you join the community! Below summarizes the processes
that we follow.

## Topics

* [Reporting Issues](#reporting-issues)
* [Working On Issues](#working-on-issues)
* [Contributing](#contributing)
* [Continuous Integration](#continuous-integration)
* [Submitting Pull Requests](#submitting-pull-requests)
* [Communication](#communication)
* [Code Architecture](#code-architecture)

## Reporting Issues

Before opening an issue, check the backlog of
[open issues](https://github.com/containers/podman-desktop/issues)
to see if someone else has already reported it. 

If so, feel free to add
your scenario, or additional information, to the discussion. Or simply
"subscribe" to it to be notified when it is updated.

If you find a new issue with the project we'd love to hear about it! The most
important aspect of a bug report is that it includes enough information for
us to reproduce it. So, please include as much detail as possible and try
to remove the extra stuff that doesn't really relate to the issue itself.
The easier it is for us to reproduce it, the faster it'll be fixed!

Please don't include any private/sensitive information in your issue!

## Working On Issues

Often issues will be assigned to someone, to be worked on at a later time.  

If you are a member of the [Containers](https://github.com/containers) organization, 
self-assign the issue with the `status/in-progress` label.

If you can not set the label: add a quick comment in the issue asking that
the `status/in-progress` label to be set and a maintainer will label it.

## Contributing

This section describes how to start a contribution to Podman Desktop.

### Prerequisites: Prepare your environment

You can develop on either: `Windows`, `macOS` or `Linux`.

Requirements: 
* [Node.js 16+](https://nodejs.org/en/)
* [yarn](https://yarnpkg.com/)

Optional Linux requirements:
* [Flatpak builder, runtime, and SDK, version 22.08](https://docs.flatpak.org/en/latest/first-build.html) 
  ```sh
  flatpak remote-add --if-not-exists flathub --user https://flathub.org/repo/flathub.flatpakrepo
  flatpak install --user flathub org.flatpak.Builder org.freedesktop.Platform//22.08 org.freedesktop.Sdk//22.08
  ```

### Step 1. Fork and clone Podman Desktop

Clone and fork the project.

Fork the repo using GitHub site and then clone the directory:

```sh
git clone https://github.com/<you>/podman-desktop && cd podman-desktop
```

### Step 2. Install dependencies

Fetch all dependencies using the command `yarn`:

```sh
yarn install
```

### Step 3. Start in watch mode

Run the application in watch mode:

```sh
yarn watch
```

The dev environment will track all files changes and reload the application respectively. 

### Step 4. Write and run tests

Write tests! Please try to write some unit tests when submitting your PR.

Run the tests using `yarn`:
```sh
yarn test
```

### Step 5. Code formatter / linter

We use `prettier` as a formatter and `eslint` for linting.

Check that your code is properly formatted with the linter and formatter:

Checking:

```sh
yarn lint:check && yarn format:check
```

Fix:

```sh
yarn lint:fix && yarn format:fix
```

### Step 6. Compile production binaries (optional)

You may want to test the binary against your local system before pushing a PR, you can do so by running the following command:

```sh
yarn compile:current
```

This will create a binary according to your local system and output it to the `dist/` folder.

## Submitting Pull Requests

### Process

Whether it is a large patch or a one-line bug fix, make sure you explain in detail what's changing!

Make sure you include the issue in your PR! For example, say: `Closes #XXX`.

PRs will be approved by an [approver][owners] listed in [`CODEOWNERS`](CODEOWNERS).

We typically require one approval for code as well as documentation-related PR's. If it is a large code-related PR, proof of review / testing (a video / screenshot) is required. 

Some tips for the PR process:

* No PR too small! Feel free to open a PR against tests, bugs, new features, docs, etc.
* Make sure you include as much information as possible in your PR so maintainers can understand.
* Try to break up larger PRs into smaller ones for easier reviewing
* Any additional code changes should be in a new commit so we can see what has changed between reviews.
* Squash your commits into logical pieces of work

### Use the correct commit message semantics

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

Some examples for correct titles would be:

* `fix: prevent racing of requests`
* `chore: drop support for Node 6`
* `docs: add quickstart guide`

For Podman Desktop we use the following types:

* `fix:` A bug fix
* `chore:` Very small change / insignificant impact
* `docs:` Documentation only changes (ex. website)
* `build:` Changes that affect the build system
* `ci:` Changes to the CI (ex. GitHub actions)
* `feat:` A new feature
* `perf:` A code change that improves performance
* `refactor:` A code change that neither fixes a bug nor adds a feature
* `style:` Changes that affect the formatting, but not the ability of the code
* `test:` Adding missing tests / new tests


Title formatting: 

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Sign your PRs

The sign-off is a line at the end of the explanation for the patch. Your
signature certifies that you wrote the patch or otherwise have the right to pass
it on as an open-source patch. 

Then you just add a line to every git commit message:

    Signed-off-by: Joe Smith <joe.smith@email.com>

Legal name must be used (no pseudonyms or anonymous contributions)

If you set your `user.name` and `user.email` git configs, you can sign your
commit automatically with `git commit -s`.


### Review process

1. Submit your PR
2. Reviewers are assigned by GitHub to two Podman Desktop developers
3. PR's require 1 LGTM / Approval (2 if it's a large code change)

> **_NOTE:_** If your PR hasn't been merged in an appropriate amount of time, ping the two developers assigned to the issue with `@`

## Continuous Integration

All pull requests and branch-merges automatically run:

* Format and lint checking
* Cross-platform builds (Windows, macOS, Linux)

You can follow these jobs in Github Actions https://github.com/containers/podman-desktop/actions

## Communication

For bugs/feature requests please [file issues](https://github.com/containers/podman-desktop/issues/new/choose)

Discussions are possible using Github Discussions https://github.com/containers/podman-desktop/discussions/

## Code Architecture

### Frameworks and tooling

Within Podman Desktop, we use the following frameworks and tools to build the desktop application:
* [Electron](https://www.electronjs.org/): In order to deploy cross-platform to multiple operating systems.
* [Svelte](https://svelte.dev/): The reactive UI/UX framework for building the interface.
* [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for the UI/UX framework.
* [Vite](https://vitejs.dev/): Dev tooling for rapid development, debugging and deployment.

> **_NOTE:_**  We also use TypeScript instead of JavaScript for strongly typed programming language development.

### Testing

Within Podman Desktop, we use the following for testing:
* [Vitest](https://vitest.dev/): Unit tests - Written as `spec.ts` files.
* [Testing Library](https://testing-library.com/): Component tests - Utilities and best practices for writing component tests.
* [Playwright](https://playwright.dev/): Integration tests.

### Folders

Below are brief descriptions on the architecture on each folder of Podman Desktop and how it's organized.

If you're unsure where to add code (renderer, UI, extensions, plugins) see the below TLDR:

* `__mocks__/`: Mock packages for Vitest.
* `buildResources`: Podman Desktop logo location / build resources for electron
* `extensions`: We separate functionality into separate "extensions" to keep Podman Desktop modular. Here you'll find extensions such as Kubernetes, CRC, Podman and Docker functionality that Podman Desktop interacts with and integrates into the API (see `packages/extension-api`). Examples include `extensions/crc`, `extensions/podman`, `extensions/docker`.
* `packages/extension-api`: The extension API for extensions such as `extensions/podman` to interact with the Podman Desktop GUI. This API acts as a "middleware" to the main Electron functionality such as displaying notifications, progress messages, configuration changes, etc.
* `packages/main`: Electron process code that is responsible for creating the app's main windows, setting up system events and communicating with other processes
* `packages/preload`: Electron code that runs before the page gets rendered. Typically has access to APIs and used to setup communication processes between the main and renderer code.
* `packages/preload-docker-extension`: Electron preload code specific to the Docker Desktop extension.
* `packages/renderer`: Electron code that runs in the renderer process. The renderer runs separate to the main process and is responsible for typically rendering the main pages of Podman Desktop. Typically, this is where you find the `.svelte` code that renders the main Podman Desktop UI.
* `scripts`: Scripts Podman Desktop requires such as `yarn watch` functionality and updating Electron vendorered modules.
* `tests`: Contains e2e tests for Podman Desktop.
* `types`: Additional types required for TypeScript.
* `website`: The documentation as well as [Podman Desktop website](https://podman-desktop.io) developed in [Docusaurus](https://docusaurus.io).
* `node_modules`: Location for Node.JS packages / dependencies.


> **_NOTE:_** Each `extension` folder is a separately packaged module. If there are any issues with loading, make sure your module is packaged correctly.

### Extensions

Podman Desktop is organized so that you can modularly add new functionality in the form of "extensions" as well as the corresponding `extension-api`. This allows you to communicate with Podman Desktop without having to know the internal-workings. You look for the API call and Podman Desktop will do the rest.

This is located in the `/extensions` folder.

#### Creating a new extension

When creating a new extension, import the extension API: `import * as extensionApi from '@podman-desktop/api';` All functionality with Podman Desktop is communicated through this API including registering the new extension. The API is located [here](https://github.com/containers/podman-desktop/blob/main/packages/extension-api/src/extension-api.d.ts).

When loading an extension, Podman Desktop will:
1. Search and load the JavaScript file specified in `main` entry of the `package.json` file in the extension directory (typically `extension.js`).
2. Run the exported `activate` function.

When unloading an extension, Podman Desktop will:
1. Run the exported `deactivate` function.


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
```

3. The above code won't work until we've created the class! So let's create a `packages/main/src/plugin/foobar-client.ts` file with the functionality:

```ts
export class FoobarClient {
  hello(input: string) {
    console.log("hello " + input);
  }
}
```

4. Last step! Call the new API call to the extension you are implementing, such as an example file `extensions/foobar/src/extension.ts`:

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


#### Testing the update mechanism (macOS or Windows only)
You may want to test the "update" mechanism of Podman Desktop, here are the following steps based on the [`electron-builder` guide](https://www.electron.build/tutorials/test-update-on-s3-locally).

##### Testing the "update" notification

In order to test that you actually get the notification, we'll build a version of your current development environment that's LOWER than the currently highest Podman Desktop version.

The **update button** functionality will **NOT WORK**. This is because `yarn compile` is built without pointing to the update server.

1. Modify [`package.json`](/package.json) to a version number that is LOWER than the latest Podman Desktop version
2. Run `yarn compile`
3. Run the compiled image from the `/dist` folder, you'll now get a notification to update.

#### Testing the "update" functionality

We will create a local Minio S3 Server that will act as our "update server". From your local machine / compiled build, you will test the download / update functionality.

For this, you need an EXTERNAL server with a publically accessible IP and port. You can either setup a public AWS S3 Storage or use Minio on a VPS.

Push the initial higher-versioned package:

1. Modify [`package.json`](/package.json) to a version number that is HIGHER (ex. `0.0.2`).
2. Create a Minio server for pushing S3 objects:
```sh
podman run -d \
   -p 9000:9000 \
   -p 9090:9090 \
   -e "MINIO_ROOT_USER=minio" \
   -e "MINIO_ROOT_PASSWORD=minio123" \
--name minio quay.io/minio/minio server /data --console-address ":9090"
```
3. Login to [EXTERNAL_IP:9090](http://EXTERNAL_IP:9090) with credentials minio/minio123
4. Create the access credentials and add it to your terminal:

```sh
export AWS_ACCESS_KEY_ID=ID
export AWS_SECRET_ACCESS_KEY=SECRET
```

Or else you will encounter a: `NoCredentialProviders: no valid providers in chain. Deprecated.` issue.
5. Create a bucket named `test-update`.
6. Set the bucket to [PUBLIC](https://github.com/electron-userland/electron-builder/issues/2233#issuecomment-341882952) (under privacy in the bucket) so our application can access / download updates / read from it.
7. Run the following command
```sh
cross-env MODE=production npm run build && electron-builder build --publish always --config .electron-builder.config.cjs --config.publish.provider=s3 --config.publish.endpoint=http://MYIPADDRESS:9000 --config.publish.bucket=test-update
```
8. After pushing, download the *.yml that is in the bucket. It may be named `latest-mac.yml` or `latest-windows.yml`. Download, rename it (Minio can't rename through the browser) to `latest.yml` and reupload it. This is what Electorn checks whenever there is an update available.

Push the lower-versioned package we will test on:

1. Modify [`package.json`](/package.json) to a version number that is LOWER (ex. `0.0.1`). This will create compiled version that will check (and update) itself on prompt
2. Run the following command to compile a dev version with the correct app update yaml and have it publish to the server:
```sh
cross-env MODE=production npm run build && electron-builder build --publish always --config .electron-builder.config.cjs --config.publish.provider=s3 --config.publish.endpoint=http://MYIPADDRESS:9000 --config.publish.bucket=test-update
```
3. Delete the `latest-mac.yml` or `latest-windows.yml` in the browser. This is automatically pushed, but we want Electron to check and see that `0.0.2` is available, not `0.0.1`.
3. Download the `0.0.1` .dmg / exe from the Minio server (Object Browser) and install it locally
4. Run the application (on macOS this must be run from the Applications folder), and it'll show that an update is available. The update functionality will work / automatically download and override your local application with the new update.