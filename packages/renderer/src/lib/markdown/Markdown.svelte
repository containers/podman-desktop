<!-- The markdown rendered has it's own style that you'll have to customize / check against podman desktop 
UI guidelines -->
<style>
.markdown > :global(p) {
  line-height: revert;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.markdown > :global(h1),
:global(h2),
:global(h3),
:global(h4),
:global(h5) {
  font-size: revert;
  line-height: normal;
  font-weight: revert;
  border-bottom: 1px solid #444;
  margin-bottom: 20px;
}

.markdown > :global(ul) {
  line-height: normal;
  list-style: revert;
  margin: revert;
  padding: revert;
}
</style>

<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { micromark } from 'micromark';
import { directive, directiveHtml } from 'micromark-extension-directive';
import { button } from './micromark-button-directive';
import { link } from './micromark-link-directive';

let text: string;
let html: string;

// Optional attribute to specify the markdown to use
// the user can use: <Markdown>**bold</Markdown> or <Markdown markdown="**bold**" /> syntax
export let markdown = '';

// Button micromark related:
//
// In progress execution callbacks for all markdown buttons.
export let inProgressMarkdownCommandExecutionCallback: (
  command: string,
  state: 'starting' | 'failed' | 'successful',
  value?: unknown,
) => void = () => {};

// Create an event listener for updating the in-progress markdown command execution callback
const eventListeners: ((e: any) => void)[] = [];

// Render the markdown or the html+micromark markdown reactively
$: markdown
  ? (html = micromark(markdown, {
      extensions: [directive()],
      htmlExtensions: [directiveHtml({ button, link })],
    }))
  : undefined;

onMount(() => {
  if (markdown) {
    text = markdown;
  }

  // Provide micromark + extensions
  html = micromark(text, {
    extensions: [directive()],
    htmlExtensions: [directiveHtml({ button, link })],
  });

  // We create a click listener in order to execute any internal commands using:
  // window.executeCommand()
  // We add the clickListener here since we're unable to add it in the directive typescript file.
  const clickListener = (e: any) => {
    // Retrieve the command within the dataset
    const command = e.target.dataset.command;

    // Only check if the command exists and the target is not disabled
    if (command && !e.target.disabled) {
      // If the target is an instance of a button element, we know that we are going to execute either
      // a command or hyperlink
      if (e.target instanceof HTMLButtonElement) {
        // If the command exists and the button is not disabled, we execute the command
        // we'll also be updating the inProgressMarkdownCommandExecutionCallback so we have
        // real-time updates on the button
        inProgressMarkdownCommandExecutionCallback(command, 'starting');
        e.target.disabled = true;
        e.target.firstChild.style.display = 'inline-block';
        window
          .executeCommand(command)
          .then(value => inProgressMarkdownCommandExecutionCallback(command, 'successful', value))
          .catch((reason: unknown) => inProgressMarkdownCommandExecutionCallback(command, 'failed', reason))
          .finally(() => {
            e.target.disabled = false;
            e.target.firstChild.style.display = 'none';
          });
      } else if (e.target instanceof HTMLAnchorElement) {
        // Execute the command since it's a simple "link" to it
        // usually associated with a dialog / quickpick action.
        window.executeCommand(command);
      }
    }
  };

  // Push the click listener to the eventListeners array so we can remove it on destroy
  eventListeners.push(clickListener);
  document.addEventListener('click', clickListener);
});

// Remove on destroy / make sure we do not listen anymore.
onDestroy(() => {
  eventListeners.forEach(listener => document.removeEventListener('click', listener));
});
</script>

<!-- Placeholder to grab the content if people are using <Markdown>**bold</Markdown> -->
<span contenteditable="false" bind:textContent="{text}" class="hidden">
  <slot />
</span>

<section class="markdown" aria-label="markdown-content">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html html}
</section>
