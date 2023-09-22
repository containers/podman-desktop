<script lang="ts">
import type { ButtonType } from './Button';
import { onMount } from 'svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import Spinner from './Spinner.svelte';

export let title: string | undefined = undefined;
export let inProgress = false;
export let disabled = false;
export let type: ButtonType = 'primary';
export let icon: any = undefined;

let iconType: string | undefined = undefined;

onMount(() => {
  if (icon?.prefix === 'fas') {
    iconType = 'fa';
  } else if (icon?.name.includes('PodIcon')) {
    iconType = 'pd';
  } else {
    iconType = 'unknown';
  }
});

let classes = '';
$: {
  if (disabled || inProgress) {
    if (type === 'primary' || type === 'secondary') {
      classes = 'bg-charcoal-50';
    } else {
      classes = 'text-charcoal-50 no-underline';
    }
  } else {
    if (type === 'primary') {
      classes = 'bg-purple-600 border-none text-white hover:bg-purple-500';
    } else if (type === 'secondary') {
      classes = 'border-[1px] border-gray-200 text-white hover:border-purple-500 hover:text-purple-500';
    } else {
      classes = 'border-none text-purple-400 hover:bg-white hover:bg-opacity-10';
    }
  }
}
</script>

<button
  type="button"
  class="relative px-4 py-[6px] rounded-[4px] box-border text-[13px] whitespace-nowrap select-none transition-all {classes} {$$props.class ||
    ''}"
  title="{title}"
  aria-label="{$$props['aria-label']}"
  on:click
  disabled="{disabled || inProgress}">
  {#if icon}
    <div class="flex flex-row p-0 m-0 bg-transparent justify-center space-x-[4px]">
      {#if inProgress}
        <Spinner size="1em" />
      {:else if iconType === 'fa'}
        <Fa icon="{icon}" />
      {:else if iconType === 'pd'}
        <svelte:component this="{icon}" size="1em" solid="{true}" />
      {:else if iconType === 'unknown'}
        <svelte:component this="{icon}" />
      {/if}
      {#if $$slots.default}
        <span><slot /></span>
      {/if}
    </div>
  {:else}
    <slot />
  {/if}
</button>
