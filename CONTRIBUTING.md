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
  flatpak install flathub org.flatpak.Builder org.freedesktop.Platform//22.08 org.freedesktop.Sdk//22.08
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


* `build:` Changes that affect the build system
* `ci:` Changes to the CI (ex. GitHub actions)
* `docs:` Documentation only changes (ex. website)
* `feat:` A new feature
* `fix:` A bug fix
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

## Continuous Integration

All pull requests and branch-merges automatically run:

* Format and lint checking
* Cross-platform builds (Windows, macOS, Linux)

You can follow these jobs in Github Actions https://github.com/containers/podman-desktop/actions

## Communication

For bugs/feature requests please [file issues](https://github.com/containers/podman-desktop/issues/new/choose)

Discussions are possible using Github Discussions https://github.com/containers/podman-desktop/discussions/
