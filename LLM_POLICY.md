# Podman Desktop LLM (AI) Development Policy

This policy establishes guidelines for using AI tools when contributing to Podman Desktop. It is adapted from the [Podman Container Tools LLM Policy](https://github.com/podman-container-tools/community/blob/main/LLM_POLICY.md) (itself based on Jellyfin's LLM Policy), tailored for a GUI application and for how our team already works.

AI-assisted contributions are welcome. LLMs are useful tools — but you, the contributor, are always responsible for what you submit.

## Direct Communication

Communicate with maintainers and the community in your own words. Don't paste raw LLM output verbatim into:

- Issues, comments, or pull request content
- Forum or chat posts
- Security reports

Using an AI assistant to help you draft is fine. Read what it produces, refine it, and make sure the final text reflects your own understanding of the change. The point is a genuine human conversation — if a maintainer can't tell whether they're talking to you or to a bot, that's the problem we're trying to avoid. Keep replies short, specific, and clearly yours.

**Exceptions:**

- Language translation — please note when text has been translated
- Maintainer-configured bots that suggest PR changes (suggestions only)

If a comment reads as unedited LLM output, a maintainer may ask you to rephrase it before the discussion continues.

## LLM Code Contributions

You may use LLMs to assist with code, but you are fully responsible for your submissions.

**Requirements:**

- Follow the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines
- Keep changes concise and focused — one concern per PR
- Match existing formatting and code style
- Remove unnecessary comments and LLM metadata
- Code must build, run, and pass tests
- Explicitly test the functionality you changed
- **Because Podman Desktop is a GUI application, any user-facing or UI change must include a screenshot or short video** showing the before/after or the new behavior. This confirms the change was actually run and reviewed by a human, not just generated.

**Understanding and Ownership:**

- Review all generated code before submitting
- Be able to explain your changes in your own words
- Be able to discuss and justify what you submitted

**Handling Review Feedback:**

- Don't paste review feedback into an LLM and blindly resubmit
- Respond thoughtfully, in your own words
- Make minimal, targeted changes
- Understand the implementations you're asked to make

**Final Discretion:** Maintainers may reject oversized, overly complex, or poorly structured PRs after correction attempts, regardless of whether an LLM was involved.

## Under Discussion

The following questions are not yet settled and are intentionally left open pending team discussion:

- Whether a contributor's first-ever submission should be made without AI assistance
- Whether fully (100%) AI-generated submissions are acceptable, and under what conditions

Until there's consensus, these are handled at maintainer discretion. Input is welcome in the tracking issue.

## The Golden Rule

"Do not prompt an LLM vaguely. Do not commit the LLM results unchanged. And do not submit them as-is."

Using LLMs as tools is acceptable. Using them as replacements for your own understanding and responsibility is not.
