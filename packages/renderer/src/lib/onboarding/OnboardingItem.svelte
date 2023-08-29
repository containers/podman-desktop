<script lang="ts">
import { onMount } from 'svelte';
import type { OnboardingStepItem } from '../../../../main/src/plugin/api/onboarding';
import Markdown from '../markdown/Markdown.svelte';
import type { ContextUI } from '../context/context';
import { SCOPE_ONBOARDING } from './onboarding-utils';
export let extension: string;
export let item: OnboardingStepItem;
export let getContext: () => ContextUI;

const onboardingContextRegex = new RegExp(/\${onboardingContext:(.+?)}/g);
const globalContextRegex = new RegExp(/\${onContext:(.+?)}/g);
let html: string;

onMount(() => {
  const itemHtml = replacePlaceholders(item.value);
  html = itemHtml;
});

function replacePlaceholders(label: string): string {
  let newLabel = label;
  newLabel = replacePlaceHoldersRegex(onboardingContextRegex, newLabel, `${extension}.${SCOPE_ONBOARDING}`);
  newLabel = replacePlaceHoldersRegex(globalContextRegex, newLabel);
  return newLabel;
}

function replacePlaceHoldersRegex(regex: RegExp, label: string, prefix?: string) {
  const matches = [...label.matchAll(regex)];
  for (const match of matches) {
    label = getNewValue(label, match, prefix);
  }
  return label;
}

function getNewValue(label: string, matchArray: RegExpMatchArray, prefix?: string) {
  if (matchArray.length > 1) {
    const key = prefix ? `${prefix}.${matchArray[1]}` : matchArray[1];
    const replacement = getContext().getValue(key);
    if (replacement) {
      return label.replace(matchArray[0], replacement.toString());
    }
  }
  return label;
}
</script>

<div class="flex justify-center {item.highlight ? 'bg-charcoal-600' : ''} p-3 m-2 rounded-md min-w-[500px]">
  {#if html}
    <Markdown>{html}</Markdown>
  {/if}
</div>
