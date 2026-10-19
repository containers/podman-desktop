<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import type { Snippet } from 'svelte';
import { createEventDispatcher } from 'svelte';

interface Props {
  icon: IconDefinition;
  selected?: boolean;
  disabled?: boolean;
  iconClass?: string;
  children?: Snippet;
}
let { icon, selected = false, disabled = false, iconClass = '', children }: Props = $props();

let displayedIconClass = $derived(disabled ? '' : iconClass);

const dispatch = createEventDispatcher();

function onclick(): void {
  selected = !selected;
  dispatch('click', selected);
}
</script>

<button
  disabled={disabled}
  aria-pressed={selected ? 'true' : 'false'}
  class="first:rounded-l last:rounded-r"
  class:bg-[var(--pd-content-card-carousel-card-bg)]={!disabled && !selected}
  class:hover:bg-[var(--pd-content-card-carousel-card-hover-bg)]={!disabled && !selected}
  class:bg-[var(--pd-content-card-selected-bg)]={!disabled && selected}
  class:hover:bg-[var(--pd-button-tab-hover-border)]={!disabled && selected}
  class:bg-[var(--pd-content-card-carousel-disabled-nav)]={disabled}
  class:hover:bg-[var(--pd-content-card-carousel-disabled-nav)]={disabled}
  class:text-[var(--pd-button-icon-disabled-text)]={disabled}
  class:cursor-not-allowed={disabled}
  onclick={onclick}>
  <div class="flex flex-row items-center space-x-2 px-2 py-1 text-xs">
    {#if icon}
      <Icon icon={icon} class={displayedIconClass} />
    {/if}
    <span>{@render children?.()}</span>
  </div>
</button>
