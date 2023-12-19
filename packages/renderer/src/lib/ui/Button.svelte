<script lang="ts">
import type { ButtonType } from './Button';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';
import Spinner from './Spinner.svelte';

export let title: string | undefined = undefined;
export let inProgress = false;
export let disabled = false;
export let type: ButtonType = 'primary';
export let icon: any = undefined;
export let selected: boolean | undefined = undefined;

$: if (selected !== undefined && type !== 'tab') {
  console.error('property selected can be used with type=tab only');
}
export let padding: string = type !== 'tab' ? 'px-4 py-[5px]' : 'px-4 pb-1';

let iconType: string | undefined = undefined;

onMount(() => {
  if (icon?.prefix === 'fas') {
    iconType = 'fa';
  } else {
    iconType = 'unknown';
  }
});

let classes = '';
$: {
  if (disabled || inProgress) {
    if (type === 'primary' || type === 'secondary') {
      classes = 'bg-charcoal-50';
    } else if (type === 'danger') {
      classes = 'border-2 border-gray-700 bg-charcoal-800';
    } else {
      classes = 'text-charcoal-50 no-underline';
    }
  } else {
    if (type === 'primary') {
      classes = 'bg-purple-600 border-none hover:bg-purple-500';
    } else if (type === 'secondary') {
      classes = 'border-[1px] border-gray-200 hover:border-purple-500 hover:text-purple-500';
    } else if (type === 'danger') {
      classes = 'border-2 border-red-600 bg-charcoal-700 hover:bg-charcoal-400';
    } else if (type === 'tab') {
      classes = 'border-b-[3px] border-charcoal-700 hover:cursor-pointer text-gray-600 no-underline';
    } else {
      classes = 'border-none text-purple-400 hover:bg-white hover:bg-opacity-10';
    }
  }

  if (type !== 'tab') {
    classes += ' rounded-[4px] text-[13px]';
  }
}
</script>

<button
  type="button"
  class="relative {padding} box-border whitespace-nowrap select-none transition-all {classes} {$$props.class || ''}"
  class:border-purple-500="{type === 'tab' && selected}"
  class:hover:border-charcoal-100="{type === 'tab' && !selected}"
  class:text-white="{(type === 'tab' && selected) || type === 'primary' || type === 'secondary' || type === 'danger'}"
  title="{title}"
  aria-label="{$$props['aria-label']}"
  on:click
  disabled="{disabled || inProgress}">
  {#if icon}
    <div class="flex flex-row p-0 m-0 bg-transparent justify-center items-center space-x-[4px]">
      {#if inProgress}
        <Spinner size="1em" />
      {:else if iconType === 'fa'}
        <Fa icon="{icon}" />
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
