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
import { onMount } from 'svelte';
import { micromark } from 'micromark';
import { directive, directiveHtml } from 'micromark-extension-directive';
import { button } from './micromark-button-directive';

let text;
let html;

// Optional attribute to specify the markdown to use
// the user can use: <Markdown>**bold</Markdown> or <Markdown markdown="**bold**" /> syntax
export let markdown = '';

$: markdown
  ? (html = micromark(markdown, {
      extensions: [directive()],
      htmlExtensions: [directiveHtml({ button })],
    }))
  : undefined;

onMount(() => {
  if (markdown) {
    text = markdown;
  }
  // provide our custom extension that allow to create buttons
  html = micromark(text, {
    extensions: [directive()],
    htmlExtensions: [directiveHtml({ button })],
  });
});
</script>

<!-- placeholder to grab the content if people are using <Markdown>**bold</Markdown> -->
<span contenteditable="false" bind:textContent="{text}" class="hidden">
  <slot />
</span>

<section class="markdown" aria-label="markdown-content">
  {@html html}
</section>
