<script lang="ts">
import { createEventDispatcher, onMount } from 'svelte';
import Fa from 'svelte-fa';

import { isFontAwesomeIcon } from '../utils/icon-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let icon: any = undefined;

let iconType: string | undefined = undefined;

const dispatch = createEventDispatcher<{ click: undefined }>();
export let onclick: () => void = () => {
  dispatch('click');
};

onMount(() => {
  if (isFontAwesomeIcon(icon)) {
    iconType = 'fa';
  } else {
    iconType = 'unknown';
  }
});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-interactive-supports-focus -->
<a
  class="text-[var(--pd-link)] hover:bg-[var(--pd-link-hover-bg)] transition-all rounded-[4px] p-0.5 no-underline cursor-pointer {$$props.class ||
    ''}"
  on:click={onclick}
  role="link"
  aria-label={$$props['aria-label']}>
  {#if icon}
    <span class="flex flex-row space-x-2">
      {#if iconType === 'fa'}
        <Fa icon={icon} />
      {/if}
      <span><slot /></span>
    </span>
  {:else}
    <slot />
  {/if}
</a>
