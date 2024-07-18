<script lang="ts">
import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import Fa from 'svelte-fa';

export let title: string;
export let tooltip: string = '';
export let icon: IconDefinition | string;
export let enabled = true;
export let hidden = false;
export let onClick: () => void = () => {};

const enabledClasses =
  'hover:bg-[var(--pd-dropdown-item-hover-bg)] hover:text-[var(--pd-dropdown-item-hover-text)] hover:rounded-md text-[var(--pd-dropdown-item-text)] hover:cursor-pointer';
const disabledClasses = 'text-[var(--pd-dropdown-disabled-item-text)] bg-[var(--pd-dropdown-disabled-item-bg)]';
</script>

{#if !hidden}
  <!-- Use a div + onclick so there's no "blind spots" for when clicking-->
  <div class={`p-2.5 ${enabled ? enabledClasses : disabledClasses}`} role="none" on:click={onClick}>
    <span
      title={tooltip !== '' ? tooltip : title}
      class="group flex items-center no-underline whitespace-nowrap"
      tabindex="-1">
      {#if typeof icon === 'string'}
        <span role="img" aria-label={title} class="{icon} h-4 w-4"></span>
      {:else}
        <Fa class="h-4 w-4 text-md" icon={icon} />
      {/if}
      {#if title}<span class="ml-2">{title}</span>{/if}
    </span>
  </div>
{/if}
