<script lang="ts">
import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import type { Component } from 'svelte';

import Icon from '../icons/Icon.svelte';

interface Props {
  title: string;
  tooltip?: string;
  icon: IconDefinition | Component | string;
  enabled?: boolean;
  hidden?: boolean;
  onClick?: () => void;
}

let { title, tooltip = '', icon, enabled = true, hidden = false, onClick = (): void => {} }: Props = $props();

const enabledClasses =
  'hover:bg-[var(--pd-dropdown-item-hover-bg)] hover:text-[var(--pd-dropdown-item-hover-text)] hover:rounded-md text-[var(--pd-dropdown-item-text)] hover:cursor-pointer';
const disabledClasses = 'text-[var(--pd-dropdown-disabled-item-text)] bg-[var(--pd-dropdown-disabled-item-bg)]';

function handleClick(): void {
  if (enabled) {
    onClick();
  }
}
</script>

{#if !hidden}
  <!-- Full-width native button: no click "blind spots", and keyboard focus/activation for free.
       aria-disabled rather than disabled keeps disabled rows focusable so screen readers can still find them. -->
  <button
    type="button"
    title={tooltip !== '' ? tooltip : title}
    class="block w-full p-2.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--pd-button-focus-ring) {enabled
      ? enabledClasses
      : disabledClasses}"
    aria-disabled={!enabled}
    onclick={handleClick}>
    <span class="group flex items-center no-underline whitespace-nowrap h-4">
      <Icon class="w-4 text-md" icon={icon} />
      {#if title}<span class="ml-2">{title}</span>{/if}
    </span>
  </button>
{/if}
