<style>
.markdown > :global(p) {
  padding-bottom: 8px;
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
