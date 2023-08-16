<script lang="ts">
import { onMount, createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa/src/fa.svelte';

export let href: string = undefined;
export let icon: any = undefined;

let iconType: string = undefined;

const dispatch = createEventDispatcher<{ click: undefined }>();

onMount(() => {
  if (icon?.prefix === 'fas') {
    iconType = 'fa';
  } else {
    iconType = 'unknown';
  }
});

function click() {
  if (href) {
    window.openExternal(href);
  } else {
    dispatch('click');
  }
}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-no-redundant-roles -->
<!-- svelte-ignore a11y-interactive-supports-focus -->
<a
  class="text-purple-400 hover:underline {$$props.class || ''}"
  on:click="{() => click()}"
  role="link"
  aria-label="{$$props['aria-label']}">
  {#if icon}
    <span class="flex flex-row space-x-2">
      {#if iconType === 'fa'}
        <Fa icon="{icon}" />
      {/if}
      <span><slot /></span>
    </span>
  {:else}
    <slot />
  {/if}
</a>
