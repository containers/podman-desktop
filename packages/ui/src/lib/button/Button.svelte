<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { Component, Snippet } from 'svelte';
import { createEventDispatcher, untrack } from 'svelte';

import Icon from '../icons/Icon.svelte';
import Spinner from '../progress/Spinner.svelte';
import type { ButtonType } from './Button';

interface Props {
  title?: string;
  inProgress?: boolean;
  disabled?: boolean;
  type?: ButtonType;
  icon?: IconDefinition | Component | string;
  selected?: boolean;
  pressed?: boolean;
  padding?: string;
  class?: string;
  hidden?: boolean;
  'aria-label'?: string;
  onclick?: () => void;
  children?: Snippet;
}

// support legacy usage (on:click)
const dispatch = createEventDispatcher<{ click: undefined }>();

let {
  title,
  inProgress = false,
  disabled = false,
  type = 'primary',
  icon,
  selected,
  pressed,
  padding,
  class: classNames,
  hidden,
  'aria-label': ariaLabel,
  onclick = dispatch.bind(undefined, 'click'),
  children,
}: Props = $props();

if (untrack(() => icon !== undefined && !title && !children && !ariaLabel)) {
  throw new Error('Icon-only buttons must have an aria-label for accessibility');
}

let actualPadding = $derived(padding ?? 'px-[16px] ' + (type === 'tab' ? 'pb-1' : 'py-[5px]'));

// aria-disabled instead of native disabled keeps the button focusable, so the title is reachable by keyboard
function handleClick(): void {
  if (disabled || inProgress) return;
  onclick();
}

let pressedActive = $derived(pressed === true && !disabled && !inProgress);

let classes = $derived.by(() => {
  let result: string;
  if (disabled || inProgress) {
    result =
      'bg-[var(--pd-button-disabled-bg)] text-[var(--pd-button-disabled-text)] border border-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring)]';
  } else if (type === 'primary') {
    result = pressedActive
      ? 'bg-[var(--pd-button-primary-hover-bg)] text-[var(--pd-button-primary-text)] border shadow-[0px_1px_4px_0px_var(--pd-shadow-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring)]'
      : 'bg-[var(--pd-button-primary-bg)] text-[var(--pd-button-primary-text)] border border-[var(--pd-button-primary-border)] hover:bg-[var(--pd-button-primary-hover-bg)] shadow-[0px_1px_4px_0px_var(--pd-shadow-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring)]';
  } else if (type === 'secondary') {
    result = pressedActive
      ? 'bg-[var(--pd-button-secondary-hover-bg)] text-[var(--pd-button-secondary-text)] border shadow-[0px_1px_4px_0px_var(--pd-shadow-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring)]'
      : 'bg-[var(--pd-button-secondary-bg)] text-[var(--pd-button-secondary-text)] border border-[var(--pd-button-secondary-border)] hover:bg-[var(--pd-button-secondary-hover-bg)] shadow-[0px_1px_4px_0px_var(--pd-shadow-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring)]';
  } else if (type === 'danger') {
    result = pressedActive
      ? 'bg-[var(--pd-button-danger-hover-bg)] text-[var(--pd-button-danger-text)] border shadow-[0px_1px_4px_0px_var(--pd-shadow-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring-danger)]'
      : 'bg-[var(--pd-button-danger-bg)] text-[var(--pd-button-danger-text)] border border-[var(--pd-button-danger-border)] hover:bg-[var(--pd-button-danger-hover-bg)] shadow-[0px_1px_4px_0px_var(--pd-shadow-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring-danger)]';
  } else if (type === 'tab') {
    result =
      'border-b-[3px] border-[var(--pd-button-tab-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring)]';
  } else if (type === 'link') {
    result = pressedActive
      ? 'bg-[var(--pd-button-link-hover-bg)] text-[var(--pd-button-link-text)] border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring)]'
      : 'bg-[var(--pd-button-link-bg)] text-[var(--pd-button-link-text)] border border-transparent hover:bg-[var(--pd-button-link-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring)]';
  } else {
    console.warn(`Unknown button type: ${type}, falling back to primary`);
    result =
      'bg-[var(--pd-button-primary-bg)] text-[var(--pd-button-primary-text)] border border-[var(--pd-button-primary-border)] hover:bg-[var(--pd-button-primary-hover-bg)] shadow-[0px_1px_4px_0px_var(--pd-shadow-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring)]';
  }

  // Set cursor states
  if (disabled) {
    result += ' cursor-not-allowed';
  } else if (inProgress) {
    result += ' cursor-wait';
  } else {
    result += ' cursor-pointer';
  }

  if (type !== 'tab') {
    result += ' rounded-[6px]';
  }

  return result;
});
</script>

<button
  type="button"
  class="relative {actualPadding} motion-reduce:transition-none min-h-[28px] min-w-[28px] leading-[15px] select-none {classes} {classNames}"
  class:border-[var(--pd-button-tab-border-selected)]={(type === 'tab' && selected === true && !disabled && !inProgress) ||
  pressedActive}
  class:hover:border-[var(--pd-button-tab-hover-border)]={type === 'tab' && !selected && !disabled && !inProgress}
  class:text-[var(--pd-button-tab-text-selected)]={type === 'tab' && selected && !disabled && !inProgress}
  class:text-[var(--pd-button-tab-text)]={type === 'tab' && !selected && !disabled && !inProgress}
  hidden={hidden}
  title={title}
  aria-label={ariaLabel}
  onclick={handleClick}
  aria-disabled={disabled || inProgress || undefined}
  aria-busy={inProgress}
  aria-pressed={pressed}>
  {#if icon ?? inProgress}
    <div
      class="flex flex-row p-0 m-0 bg-transparent justify-center items-center space-x-[4px]"
      class:py-[3px]={!children}>
      {#if inProgress}
        <Spinner size="1em" />
      {:else if icon}
        <Icon icon={icon}/>
      {/if}
      {#if children}
        <span>{@render children()}</span>
      {/if}
    </div>
  {:else}
    {@render children?.()}
  {/if}
</button>
