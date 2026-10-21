<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { Component, Snippet } from 'svelte';
import { createEventDispatcher, untrack } from 'svelte';

import Icon from '../icons/Icon.svelte';
import Spinner from '../progress/Spinner.svelte';
import type { ButtonType } from './Button';

interface Props {
  /**
   * Native tooltip, shown on mouse hover only, so keyboard and touch users never see it. Use it for extra
   * hints, not as the only name of an icon-only button: set `aria-label` for that.
   */
  title?: string;

  /**
   * Shows a spinner in place of the icon, sets `aria-busy`, and disables the button until the action finishes.
   */
  inProgress?: boolean;

  /**
   * Disables the button. A disabled button is removed from the tab order, so explain why it is disabled
   * in visible text near the button rather than in `title`.
   */
  disabled?: boolean;

  /**
   * Visual style: `primary` (default) for the main action, `secondary` for other actions, `danger` for
   * destructive actions, `link` for Cancel, Close and other low-emphasis actions, `tab` for tab-like filters
   * and navigation. An unknown value falls back to `primary` with a console warning.
   */
  type?: ButtonType;

  /**
   * Icon shown before the label. An icon-only button needs `aria-label`. The component throws on mount when
   * there is no label, `title` or `aria-label`, but any body counts as a label, even an empty `{''}`, so the
   * check does not catch an empty label variable.
   */
  icon?: IconDefinition | Component | string;

  /**
   * Marks a `tab` button as the active one. Visual only, it does not set `aria-selected`.
   * Use `pressed` for toggle buttons instead.
   */
  selected?: boolean;

  /**
   * Makes the button a toggle and sets `aria-pressed`. Leave undefined for a regular button,
   * since `false` still announces it as a toggle.
   */
  pressed?: boolean;

  /**
   * Tailwind padding classes. Replaces the default padding entirely (`px-[16px] py-[5px]`, or
   * `px-[16px] pb-1` for tabs), so set both axes.
   */
  padding?: string;

  /**
   * Extra classes, appended after the built-in ones. Use for layout (width, margins), not to restyle the button.
   */
  class?: string;

  /** Hides the button with the native `hidden` attribute. */
  hidden?: boolean;

  /**
   * Accessible name. Icon-only buttons need it; `title` also passes the icon-only check, but use it as an
   * extra tooltip, not as the only name. When the button also has visible text, the label must
   * contain that text (WCAG 2.5.3 Label in Name), for example `Delete container web-1` for a `Delete` button.
   */
  'aria-label'?: string;

  /** Click handler. Prefer it over the legacy `on:click` event, which is kept for Svelte 4 callers. */
  onclick?: () => void;

  /** Visible label. Use sentence case, see CODE-GUIDELINES.md. */
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

let pressedActive = $derived(pressed === true && !disabled && !inProgress);

let classes = $derived.by(() => {
  let result: string;
  if (disabled || inProgress) {
    result = 'bg-[var(--pd-button-disabled-bg)] text-[var(--pd-button-disabled-text)] border border-transparent';
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
  onclick={onclick}
  disabled={disabled || inProgress}
  aria-disabled={disabled || inProgress}
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
