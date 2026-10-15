<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import type { Component } from 'svelte';

import ChevronExpander from '../icons/ChevronExpander.svelte';
import Icon from '../icons/Icon.svelte';
import { KeyboardUtils } from '../utils/keyboard-utils';

interface Props {
  title: string;
  href: string;
  section?: boolean;
  expanded?: boolean;
  ariaControls?: string;
  child?: boolean;
  selected?: boolean;
  icon?: IconDefinition | Component | string;
  iconRight?: IconDefinition | Component | string;
  iconRightAlign?: 'inline' | 'end';
  onClick?: () => void;
  onToggle?: () => void;
  ariaKeyShortcuts?: string;
  onKeyDown?: (event: KeyboardEvent) => void;
}

let {
  title,
  href,
  section = false,
  expanded = $bindable(),
  ariaControls,
  child = false,
  selected = false,
  icon = undefined,
  iconRight = undefined,
  iconRightAlign = 'end',
  onClick = (): void => {},
  onToggle = (): void => {},
  ariaKeyShortcuts,
  onKeyDown,
}: Props = $props();

const keyboardUtils = new KeyboardUtils();

let sanitizedKeyShortcuts = $derived(keyboardUtils.sanitizeAriaKeyShortcuts(ariaKeyShortcuts));
let toggleLabel = $derived(`Toggle ${title}`);

function toggle(): void {
  expanded = !expanded;
  onToggle();
}
</script>

<div
  data-settings-nav-row
  class="flex box-border w-full items-center border-l-[4px]"
  class:leading-none={child}
  class:text-md={!child}
  class:font-medium={!child}
  class:bg-[var(--pd-secondary-nav-selected-bg)]={selected}
  class:border-[var(--pd-secondary-nav-bg)]={!selected}
  class:border-[var(--pd-secondary-nav-selected-highlight)]={selected}
  class:text-[color:var(--pd-secondary-nav-text-selected)]={selected}
  class:text-[color:var(--pd-secondary-nav-text)]={!selected}
  class:hover:text-[color:var(--pd-secondary-nav-text-hover)]={!selected}
  class:hover:bg-[var(--pd-secondary-nav-text-hover-bg)]={!selected}
  class:hover:border-[var(--pd-secondary-nav-text-hover-bg)]={!selected}>
  <a
    class="no-underline flex min-w-0 grow py-2 items-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--pd-button-focus-ring)"
    class:pl-3={!child}
    class:pl-[34px]={child}
    class:pr-3={!child && !section}
    class:pr-2={child}
    href={href}
    aria-label={title}
    title={title}
    aria-keyshortcuts={sanitizedKeyShortcuts}
    onclick={onClick}
    onkeydown={onKeyDown}>
    <span class="flex flex-row gap-x-2 items-center min-w-0 grow" class:capitalize={!child} class:items-start={child}>
      {#if icon}
        <span class="w-4 shrink-0 flex justify-center">
          <Icon icon={icon}/>
        </span>
      {/if}
      <span
        data-settings-nav-title
        class="block"
        class:truncate={!child}
        class:whitespace-normal={child}
        class:break-words={child}>{title}</span>
      {#if iconRight && iconRightAlign === 'inline'}
        <Icon icon={iconRight}/>
      {/if}
    </span>
    {#if !section}
      <span class="w-3 shrink-0 flex items-center justify-end">
        {#if iconRight && iconRightAlign === 'end'}
          <Icon icon={iconRight}/>
        {/if}
      </span>
    {/if}
  </a>
  {#if section}
    <button
      type="button"
      class="min-w-8 min-h-8 shrink-0 self-stretch flex items-center justify-center cursor-pointer text-(--pd-secondary-nav-expander) focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--pd-button-focus-ring)"
      aria-label={toggleLabel}
      aria-expanded={expanded ?? false}
      aria-controls={ariaControls}
      title={toggleLabel}
      onclick={toggle}>
      <span aria-hidden="true" class="pointer-events-none">
        <ChevronExpander expanded={expanded} />
      </span>
    </button>
  {/if}
</div>
