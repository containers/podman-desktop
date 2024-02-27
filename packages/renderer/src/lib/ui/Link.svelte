<script lang="ts">
import { onMount, createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa';
import { router } from 'tinro';

export let internalRef: string | undefined = undefined;
export let externalRef: string | undefined = undefined;
export let icon: any = undefined;

let iconType: string | undefined = undefined;

const dispatch = createEventDispatcher<{ click: undefined }>();

onMount(() => {
  if (icon?.prefix === 'fas') {
    iconType = 'fa';
  } else {
    iconType = 'unknown';
  }
});

function click() {
  if (internalRef) {
    router.goto(internalRef);
  } else if (externalRef) {
    window.openExternal(externalRef);
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
  class="text-purple-400 hover:bg-white hover:bg-opacity-10 transition-all rounded-[4px] p-0.5 no-underline cursor-pointer {$$props.class ||
    ''}"
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
