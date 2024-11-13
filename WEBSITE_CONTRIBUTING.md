# Contributing to podman-desktop.io

Contributing to the Podman Desktop website is a valuable way to support the project. Here are several ways you can contribute:

- **Enhancing Content:** Improve existing pages by updating information, correcting inaccuracies, or adding new sections.
- **Writing Blog Posts:** Share insights, tutorials, or news related to Podman Desktop by authoring blog posts. 
- **Improving Documentation:** Contribute to the website's documentation by clarifying instructions, adding examples.
- **Design and Usability Enhancements:** If you have design skills, propose improvements to the website's layout, navigation, or overall user experience to make it more intuitive and visually appealing.
- **Reporting and Fixing Issues:** Identify and report bugs or issues on the website, such as broken links or formatting problems. If you have web development skills, you can also contribute by fixing these issues.
- **Search Engine Optimization (SEO):** Suggest or implement strategies to improve the website's visibility on search engines, helping more users discover Podman Desktop.

The below information outlines details on how to both contribute as well as our documentation "templates" and criteria.

## Folders

Here is a brief description of the folders for the website of Podman Desktop and how they are organized.

- `blogs`: All the blog posts published on [https://podman-desktop.io/blog](https://podman-desktop.io/blog).
- `blogs/img`: Store all the images used in the the blog posts.
- `docs`: All documentation published on [https://podman-desktop.io/docs](https://podman-desktop.io/docs).
- `tutorials`: All tutorials published on [https://podman-desktop.io/tutorial](https://podman-desktop.io/tutorial).
- `src`: Content for the website.
- `src/pages`: All sub pages available on the website.

## Propose a Blog post

### Create a new author information

If you are not yet an author on Podman Desktop blog, you'll need to add yourself to the list of authors in `blogs/authors.yml` following this pattern:

```yaml
authorid:
  name: Your Name
  title: Your Title
  url: your GitHub link 
  image_url: your GitHub 
```

### Create a new post

In order to propose a new blog post, you'll need to do a pull request on the repository. Posts are authored as markdown files and are following a specific pattern:

```md
---
title: Title of the blog post
description: Description and short summary of the post
slug: Unique identifier of the page used for the URL (example: podman-desktop-release-1.11).
authors: Your author ID on podman desktop blog
tags: Tags for the post (example: [podman-desktop, release, podman])
hide_table_of_contents: false
image: Path to the hero image for the post (example: /img/blog/podman-desktop-release-1.11/banner.png).
---
```

If you need to include images and videos, you'll need to create a new folder in `blog/img` 

### Videos

If you want to include gifs and videos in your blog post, you'll need to import the following player at the top of your content:
`import ReactPlayer from 'react-player'`

Then in your blog post content use the following (and replace the URL):
`<ReactPlayer playing playsinline controls url="path to your video file" width='100%' height='100%' />` 


## Documentation information

All documentation is located within [/website/docs](/website/docs).

The website is built using [docusaurus](https://docusaurus.io/) and published to [podman-desktop.io](https://podman-desktop.io) on each commit.

### Tips

- When referring to a clickable button in the interface, **bold** the name. For example: Click on the **Extensions** button.

## Previewing the website

The website can be previewed by running the following command:

```sh
pnpm website:dev
```

Which will automatically open your browser to `localhost:3000`.

You may also build a "production-like" environment by using:

```sh
pnpm website:prod
```

## Pull request previews

On each pull request we use ArgosCI to do screenshot-comparison to check for any major changes. This may have to be manually approved.

You can also find the Netlify link within the "Checks" section of the pull request for a live-preview of your documentation changes.

## Formatting and lint checking

Formatting and lint checking can be examined by running the following commands:

```sh
# Markdown formatting
pnpm format:check
pnpm format:fix

# Markdown lint checking
pnpm markdownlint:check
pnpm markdownlint:fix
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
