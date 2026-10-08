# Release notes output template

Use the structure and naming conventions of release posts in `website/blog/`.
`{{field}}` is a single value to substitute. `{{#list}} ... {{/list}}` means
"repeat the block once per item in `list`, with that item's fields available
inside the block"; skip the block entirely if the list is empty.

If no highlights qualify, omit the introductory highlights sentence and
Release details section. Use MDX comments for image placeholders.
For known issues, use an empty `knownIssueSections` list or a one-item list
whose `issues` field contains the verified issues; omit the section when the
list is empty.

Write the output file with exactly this structure, substituting real values:

```text
---
title: Podman Desktop {{version}} Release
description: Podman Desktop {{version}} has been released!
slug: podman-desktop-release-{{version}}
authors: [{{username}}]
tags: [podman-desktop, release, kubernetes, openshift]
hide_table_of_contents: false
image: /img/blog/podman-desktop-release-{{version}}/banner.png
---

Podman Desktop {{version}} Release! 🎉

![podman-desktop-hero-{{version}}](/img/blog/podman-desktop-release-{{version}}/banner.png)

Podman Desktop {{version}} is now available. [Click here to download it](/downloads)!

This release brings exciting new features and improvements:

{{#highlighted}}
- **{{title}}**: {{shortDesc}}
{{/highlighted}}

{/* truncate */}

---

## Release details

{{#highlighted}}
### {{title}}

{/* Place for image */}

{{longDesc}}

{{/highlighted}}

{{#knownIssueSections}}
### Known issues

{{#issues}}
- **{{title}}**: {{description}} ([#{{number}}]({{link}}))
{{/issues}}
{{/knownIssueSections}}

---

## Community thank you

🎉 We’d like to say a big thank you to everyone who helped to make Podman Desktop even better. In this
release we received pull requests from the following people:

{{#firstTimeContributors}}
- [{{author.username}}]({{author.link}}) in [{{title}}]({{link}})

{{/firstTimeContributors}}

---

## Community meeting

If you would like to discuss any of the new features, issues or other topics, please join us at the monthly community meeting that takes place <b>every 4th Thursday of the month</b>. Here are the <b>meeting [details](https://github.com/podman-desktop/community/issues?q=is%3Aissue%20state%3Aopen%20Agenda%20for%20Podman%20Desktop)</b>.

---

## Final notes

See the complete lists of [closed issues](https://github.com/podman-desktop/podman-desktop/issues?q=is%3Aissue+is%3Aclosed+milestone%3A{{milestone}}) and [merged pull requests](https://github.com/podman-desktop/podman-desktop/pulls?q=is%3Amerged+milestone%3A{{milestone}}) in this release.

Get the latest release from the [Downloads](/downloads) section of the website and boost your development journey with Podman Desktop. Additionally, visit the [GitHub repository](https://github.com/podman-desktop/podman-desktop) and see how you can help us make Podman Desktop better.


## Detailed release changelog
{{#changelog}}

### {{category}}
{{#prs}}
- {{title}} by @{{author.username}} [#{{number}}]({{link}})
{{/prs}}
{{/changelog}}
```
