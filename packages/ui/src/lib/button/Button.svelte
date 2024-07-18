<script lang="ts">
import { onMount } from 'svelte';
import Fa from 'svelte-fa';

import Spinner from '../progress/Spinner.svelte';
import { isFontAwesomeIcon } from '../utils/icon-utils';
import type { ButtonType } from './Button';

export let title: string | undefined = undefined;
export let inProgress = false;
export let disabled = false;
export let type: ButtonType = 'primary';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let icon: any = undefined;
export let selected: boolean | undefined = undefined;

$: if (selected !== undefined && type !== 'tab') {
  console.error('property selected can be used with type=tab only');
}
export let padding: string =
  'px-4 ' + (type === 'tab' ? 'pb-1' : type === 'secondary' ? 'py-[4px]' : type === 'danger' ? 'py-[3px]' : 'py-[5px]');

let iconType: string | undefined = undefined;

onMount(() => {
  if (isFontAwesomeIcon(icon)) {
    iconType = 'fa';
  } else {
    iconType = 'unknown';
  }
});

let classes = '';
$: {
  if (disabled || inProgress) {
    if (type === 'primary') {
      classes = 'bg-[var(--pd-button-disabled)]';
    } else if (type === 'secondary') {
      classes = 'border-[1px] border-[var(--pd-button-disabled)] bg-[var(--pd-button-disabled)]';
    } else if (type === 'danger') {
      classes =
        'border-2 border-[var(--pd-button-danger-disabled-border)] text-[var(--pd-button-danger-disabled-text)] bg-[var(--pd-button-danger-disabled-bg)]';
    }
    if (type !== 'danger') {
      classes += ' text-[var(--pd-button-disabled-text)]';
    }
  } else {
    if (type === 'primary') {
      classes =
        'bg-[var(--pd-button-primary-bg)] text-[var(--pd-button-text)] border-none hover:bg-[var(--pd-button-primary-hover-bg)]';
    } else if (type === 'secondary') {
      classes =
        'border-[1px] border-[var(--pd-button-secondary)] text-[var(--pd-button-secondary)] hover:bg-[var(--pd-button-secondary-hover)] hover:border-[var(--pd-button-secondary-hover)] hover:text-[var(--pd-button-text)]';
    } else if (type === 'danger') {
      classes =
        'border-2 border-[var(--pd-button-danger-border)] bg-[var(--pd-button-danger-bg)] text-[var(--pd-button-danger-text)] hover:bg-[var(--pd-button-danger-hover-bg)] hover:text-[var(--pd-button-danger-hover-text)]';
    } else if (type === 'tab') {
      classes = 'border-b-[3px] border-[var(--pd-button-tab-border)]';
    } else {
      // link
      classes = 'border-none text-[var(--pd-button-link-text)] hover:bg-[var(--pd-button-link-hover-bg)]';
    }
  }

  if (type !== 'tab') {
    classes += ' rounded-[4px]';
  }
}
</script>

<button
  type="button"
  class="relative {padding} box-border whitespace-nowrap select-none transition-all {classes} {$$props.class ?? ''}"
  class:border-[var(--pd-button-tab-border-selected)]={type === 'tab' && selected}
  class:hover:border-[var(--pd-button-tab-hover-border)]={type === 'tab' && !selected}
  class:text-[var(--pd-button-tab-text-selected)]={type === 'tab' && selected}
  class:text-[var(--pd-button-tab-text)]={type === 'tab' && !selected}
  hidden={$$props.hidden}
  title={title}
  aria-label={$$props['aria-label']}
  on:click
  disabled={disabled || inProgress}>
  {#if icon || inProgress}
    <div
      class="flex flex-row p-0 m-0 bg-transparent justify-center items-center space-x-[4px]"
      class:py-[3px]={!$$slots.default}>
      {#if inProgress}
        <Spinner size="1em" />
      {:else if isFontAwesomeIcon(icon)}
        <Fa icon={icon} />
      {:else if iconType === 'unknown'}
        <svelte:component this={icon} />
      {/if}
      {#if $$slots.default}
        <span><slot /></span>
      {/if}
    </div>
  {:else}
    <slot />
  {/if}
</button>
