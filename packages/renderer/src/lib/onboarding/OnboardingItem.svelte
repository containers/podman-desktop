<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import type { OnboardingViewItem } from '../../../../main/src/plugin/api/onboarding';
import Markdown from '../markdown/Markdown.svelte';
import type { ContextUI } from '../context/context';
export let item: OnboardingViewItem;
export let step: string;
export let extensionId: string;
export let context: ContextUI;
export let setExecuting: (isExecuting: boolean) => void;
export let getExecutionId: () => number;
const re = new RegExp(/\${(.+?)}/g);
let html;
let isMarkdown = false;
$: buttons = new Map<string, string>();
const eventListeners = [];
onMount(() => {
  const itemHtml = createItem(item);
  html = itemHtml;
  const clickListener = async e => {
    if (e.target instanceof HTMLButtonElement) {
      const buttonId = e.target.id;
      let command = buttons.get(buttonId);
      if (command) {
        setExecuting(true);
        await window.executeOnboardingCommand(getExecutionId(), extensionId, step, command);
        setExecuting(false);
      }
    }
  };
  eventListeners.push(clickListener);
  /* eslint-disable @typescript-eslint/no-misused-promises */
  document.addEventListener('click', clickListener);
});
onDestroy(() => {
  eventListeners.forEach(listener => document.removeEventListener('click', listener));
});
function createItem(item: OnboardingViewItem): string {
  let html = '';
  switch (item.component) {
    case 'button': {
      const buttonId = `button-${buttons.size}`;
      const value = `<button id="${buttonId}" class="bg-purple-700 py-2 px-2.5 rounded-md">${item.label}</button>`;
      buttons.set(buttonId, item.command);
      buttons = buttons;
      html = value;
      break;
    }
    default: {
      html = replacePlaceholders(item.value);
      isMarkdown = true;
    }
  }
  return html;
}
function replacePlaceholders(label: string): string {
  let newLabel = label;
  let arr;
  // eslint-disable-next-line eqeqeq
  while ((arr = re.exec(newLabel)) != undefined) {
    if (arr.length > 1) {
      const replacement = context.getDottedKeyValue(arr[1]);
      if (replacement) {
        newLabel = newLabel.replace(arr[0], replacement.toString());
      }
    }
  }
  return newLabel;
}
</script>

<div
  class="flex justify-center {item.template === 'dark_bg' ? 'bg-charcoal-600' : ''} p-3 m-2 rounded-md min-w-[500px]">
  {#if html}
    {#if !isMarkdown}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html html}
    {:else}
      <Markdown>{html}</Markdown>
    {/if}
  {/if}
</div>
