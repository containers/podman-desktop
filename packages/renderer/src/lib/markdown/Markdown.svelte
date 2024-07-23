<!-- The markdown rendered has it's own style that you'll have to customize / check against podman desktop
UI guidelines -->
<style lang="postcss">
.markdown > :global(p) {
  line-height: normal;
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

.markdown > :global(b),
:global(strong) {
  font-weight: 600;
}
.markdown > :global(blockquote) {
  opacity: 0.8;
  line-height: normal;
}
.markdown :global(a) {
  color: theme(colors.purple.500);
  text-decoration: none;
}
.markdown :global(a):hover {
  color: theme(colors.purple.400);
  text-decoration: underline;
}
</style>

<script lang="ts">
import { micromark } from 'micromark';
import { directive, directiveHtml } from 'micromark-extension-directive';
import { onDestroy, onMount } from 'svelte';

import { button } from './micromark-button-directive';
import { link } from './micromark-link-directive';
import { createListener } from './micromark-listener-handler';
import { warnings } from './micromark-warnings-directive';

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
      htmlExtensions: [directiveHtml({ button, link, warnings })],
    }))
  : undefined;

onMount(() => {
  if (markdown) {
    text = markdown;
  }

  // Provide micromark + extensions
  html = micromark(text, {
    extensions: [directive()],
    htmlExtensions: [directiveHtml({ button, link, warnings })],
  });

  // remove href values in each anchor using # for links
  // and set the attribute data-pd-jump-in-page
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = doc.querySelectorAll('a');
  links.forEach(link => {
    const currentHref = link.getAttribute('href');
    // remove and replace href attribute if matching
    if (currentHref?.startsWith('#')) {
      // get current value of href
      link.removeAttribute('href');

      // remove from current href the #
      const withoutHashHRef = currentHref.substring(1);

      // add an attribute to handle onclick
      link.setAttribute('data-pd-jump-in-page', withoutHashHRef);

      // add a class for cursor
      link.classList.add('cursor-pointer');
    }
  });

  // for all h1/h2/h3/h4/h5/h6, add an id attribute being the name of the attibute all in lowercase without spaces (replaced by -)
  const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headers.forEach(header => {
    const headerText = header.textContent;
    const headerId = headerText?.toLowerCase().replace(/\s/g, '-');
    if (headerId) {
      header.setAttribute('id', headerId);
    }
  });

  html = doc.body.innerHTML;

  // We create a click listener in order to execute any internal micromark commands
  // We add the clickListener here since we're unable to add it in the directive typescript file.
  const clickListener = createListener(inProgressMarkdownCommandExecutionCallback);

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
<span contenteditable="false" bind:textContent={text} class="hidden">
  <slot />
</span>

<section class="markdown" aria-label="markdown-content">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html html}
</section>
