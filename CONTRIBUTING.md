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

Before reporting an issue, check our backlog of
[open issues](https://github.com/containers/podman-desktop/issues)
to see if someone else has already reported it. If so, feel free to add
your scenario, or additional information, to the discussion. Or simply
"subscribe" to it to be notified when it is updated.

If you find a new issue with the project we'd love to hear about it! The most
important aspect of a bug report is that it includes enough information for
us to reproduce it. So, please include as much detail as possible and try
to remove the extra stuff that doesn't really relate to the issue itself.
The easier it is for us to reproduce it, the faster it'll be fixed!

Please don't include any private/sensitive information in your issue!

## Working On Issues

Once you have decided to contribute to Podman Desktop by working on an issue, check our
backlog of [open issues](https://github.com/containers/podman-desktop/issues) looking
for any that do not have an `status/in-progress` label attached to it.  Often issues
will be assigned to someone, to be worked on at a later time.  If you have the
time to work on the issue now add yourself as an assignee, and set the
`status/in-progress` label if you’re a member of the “Containers” GitHub organization.
If you can not set the label, just  add a quick comment in the issue asking that
the `status/in-progress` label be set and a member will do so for you.

## Contributing

This section describes how to start a contribution to Podman Desktop.

### Prepare your environment

Requirements: Node.js 16 and yarn

It is building an electron application so it is working on both Windows, MacOS and Linux.

### Fork and clone Podman Desktop

First you need to fork this project https://github.com/containers/podman-desktop on GitHub.

Then clone your fork locally:
```shell
$ git clone https://github.com/<you>/podman-desktop
$ cd desktop
```

### Deal with Node.js

It is a Node.js application so please ensure Node.js 16+ and Yarn v1 are there.

Fetch all dependencies using the command `yarn`

[package.json](package.json) files contains some predefined commands.

### Use development mode

Run the application in development with a single command: `yarn watch`

It will track all the changes, rebuild the modified files and reload the application.

### Build production binaries

Run `yarn compile:current` and it will build a production binary for your current Operating System using electron-builder.

The ouput binary is generated in `dist/` folder

## Submitting Pull Requests

### Before submitting Pull Requests

Ensure that format and lint rules are compliant.
Run `yarn format:check` or `yarn lint:check`
It uses `prettier` as formatter and eslint for the linting rules.

### Process

No Pull Request (PR) is too small! Typos, additional comments in the code,
new test cases, bug fixes, new features, more documentation, ... it's all
welcome!

While bug fixes can first be identified via an "issue", that is not required.
It's ok to just open up a PR with the fix, but make sure you include the same
information you would have included in an issue - like how to reproduce it.

PRs for new features should include some background on what use cases the
new code is trying to address. When possible and when it makes sense, try to break-up
larger PRs into smaller ones - it's easier to review smaller
code changes. But only if those smaller ones make sense as stand-alone PRs.

Squash your commits into logical pieces of work that might want to be reviewed
separate from the rest of the PRs. But, squashing down to just one commit is ok
too since in the end the entire PR will be reviewed anyway. When in doubt,
squash.

PRs that fix issues should include a reference like `Closes #XXXX` in the
commit message so that GitHub will automatically close the referenced issue
when the PR is merged.

PRs will be approved by an [approver][owners] listed in [`CODEOWNERS`](CODEOWNERS).

### Describe your Changes in Commit Messages

Describe your problem. Whether your patch is a one-line bug fix or 5000 lines
of a new feature, there must be an underlying problem that motivated you to do
this work. Convince the reviewer that there is a problem worth fixing and that
it makes sense for them to read past the first paragraph.

Please follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Example of types are:  `build:, chore:, ci:, docs:, style:, refactor:, perf:, test:`

For example `fix: ....` , `feat: ....`

### Sign your PRs

The sign-off is a line at the end of the explanation for the patch. Your
signature certifies that you wrote the patch or otherwise have the right to pass
it on as an open-source patch. 

Then you just add a line to every git commit message:

    Signed-off-by: Joe Smith <joe.smith@email.com>

Use your real name (sorry, no pseudonyms or anonymous contributions.)

If you set your `user.name` and `user.email` git configs, you can sign your
commit automatically with `git commit -s`.

### Format and lint

All code changes must pass ``yarn format:check`` and ``yarn lint:check``.

## Continuous Integration

All pull requests and branch-merges automatically run:

* format/lint checking
* build check across different platforms (Windows, macOS, Linux)

You can follow these jobs in Github Actions https://github.com/containers/podman-desktop/actions

## Communication

For bugs/feature requests please [file issues](https://github.com/containers/podman-desktop/issues/new/choose)

Discussions are possible using Github Discussions https://github.com/containers/podman-desktop/discussions/
