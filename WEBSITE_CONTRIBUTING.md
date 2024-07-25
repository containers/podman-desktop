# Contributing to podman-desktop.io

Thank you for your interest in improving the website!

The below information outlines details on how to both contribute as well as our documentation "templates" and criteria.

## Documentation information

All documentation is located within [/website/docs](/website/docs).

The website is built using [docusaurus](https://docusaurus.io/) and published to [podman-desktop.io](https://podman-desktop.io) on each commit.

### Tips

- When referring to a clickable button in the interface, **bold** the name. For example: Click on the **Extensions** button.

## Previewing the website

The website can be previewed by running the following command:

```sh
yarn website:dev
```

Which will automatically open your browser to `localhost:3000`.

You may also build a "production-like" environment by using:

```sh
yarn website:prod
```

## Pull request previews

On each pull request we use ArgosCI to do screenshot-comparison to check for any major changes. This may have to be manually approved.

You can also find the Netlify link within the "Checks" section of the pull request for a live-preview of your documentation changes.

## Formatting and lint checking

Formatting and lint checking can be examined by running the following commands:

```sh
# Markdown formatting
yarn format:check
yarn format:fix

# Markdown lint checking
yarn markdownlint:check
yarn markdownlint:fix
```

## Screenshot and video standards

We want to maintain **consistency** between screenshots that make it readable for all users.

### Screenshots

Ideally your screenshot should be:

- 1060px width
- 710px height
- Have a very small border
- Ideally have a transparent background

This matches the ratio of Podman Desktop's default size of 1050x700 as well as gives a few pixels spacing for a border.

Tips:

- Use a **red** circle to emphasize points of interest / draw the users eyes towards.
- If you are unable to put the entire example in the screenshot, **zoom out** Podman Desktop (View -> Zoom Out) and re-take the screenshot.

### Video & gifs

Gifs and video are acceptable granted they are:

- Small in size (under 3mb)
- Less than 10 seconds long
- Uses compression. For gifs, use software such as [gifski](https://gif.ski/) with CLI commands such as `--fps 10 --quality 70`.

## Templates

Below are some "templates" to be used when writing documentation.

These do not encompass all scenarios, but gives you a foundation of how to write documentation.

### Metadata

All files should have the following metadata:

```
---
title: Your title
description: Small one sentence description
sidebar_position: 1 # Weight depending on the position you want
keywords: [multiple, keywords, as-needed]
tags: [category]
---
```

### Standard template

The most common template that requires a prerequisites section and "tutorial" / procedural section in order to teach the user something.

```markdown
# <Title of the section>

<Brief description of what this will teach the user>

#### Prerequisites <optional>

<Bullet point list of prerequisites>

#### Procedure

<Typically a numbered list of steps, although not an enforced standard>

#### Verification <optional>

<Steps to verify that the procedure worked as intended>

#### Additional resources <optional>

Links to further information (could be podman desktop documentation, or outside links)
```

### Troubleshooting

A "typical" list of troubleshooting scenarios and their solutions.

```markdown
# <Title of the troubshooting section>

## <Specific issue>

One sentence general information about the issue

### Issues encountered: <this usually will contain log outputs typically encountered, below are good examples>

`docker-credential-desktop` missing:

<log output in code block>

Authentication access:

<log output in code block>

### Solution:

Delete the `~/.docker/config` to clear any errors. <example solution>
```

### Schema / `package.json` explanations

A template for describing a new feature being added for `package.json`. For example: `commands` or `icon`.

```markdown
# <Title of the section>

## Configuration details

<Main description of the new feature being added>

### `package.json` Example

<Brief explanation of the example>

\`\`\`json
{
"<key>": {
"<property>": "<value>",
"<additional settings>": {
"<setting>": "<setting value>"
}
}
}
\`\`\`

### Advanced Configuration

<Further details, tips, or troubleshooting steps>

### JSON Schema

<More granular details or step-by-step breakdown>

\`\`\`json
{
"<key>": "<example configuration>"
}
\`\`\`

<Explanation of what the JSON configuration achieves>

### Verification <optional>

<Steps to verify the process or solution worked as intended>

### Additional Resources <optional>

<Bullet points of further resources>

- [External Link Description](URL)
- Further reading or related documentation
```
