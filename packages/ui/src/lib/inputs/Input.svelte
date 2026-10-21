<script lang="ts">
import { faCircleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher, type Snippet } from 'svelte';
import type { Booleanish, FormEventHandler, HTMLInputTypeAttribute, KeyboardEventHandler } from 'svelte/elements';
import { createBubbler } from 'svelte/legacy';

import Icon from '../icons/Icon.svelte';

const dispatch = createEventDispatcher();
const bubble = createBubbler();

interface Props {
  placeholder?: string;
  id?: string;
  name?: string;
  value?: string;
  readonly?: boolean;
  required?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  class?: string;
  inputClass?: string;
  showError?: boolean;
  element?: HTMLInputElement;
  'aria-label'?: string;
  'aria-invalid'?: Booleanish | 'grammar' | 'spelling' | null;
  left?: Snippet;
  right?: Snippet;
  oninput?: FormEventHandler<HTMLInputElement>;
  onkeypress?: KeyboardEventHandler<HTMLInputElement>;
  title?: string;
  type?: HTMLInputTypeAttribute;
  min?: string | number;
  minlength?: number;
  max?: string | number;
  maxlength?: number;
  pattern?: string;
}

let {
  left,
  right,
  placeholder,
  id,
  name,
  value = $bindable(),
  readonly = $bindable(false),
  required = false,
  clearable = false,
  disabled = false,
  error,
  inputClass = '',
  class: propsClass = '',
  showError = true,
  element = $bindable(),
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  oninput = bubble('input'),
  onkeypress = bubble('keypress'),
  title = '',
  type = 'text',
  min,
  minlength,
  max,
  maxlength,
  pattern,
}: Props = $props();

let enabled = $derived(!readonly && !disabled);

// clear the value if the parent doesn't override
async function onClear(): Promise<void> {
  if (dispatch('action', { cancelable: true })) {
    value = '';
    if (element) {
      // need to trigger normal input event for oninput listeners
      element.value = value;
      element.dispatchEvent(new InputEvent('input'));
    }
  }
}
</script>

<div class="flex flex-col grow">
  <div
    class="flex flex-row grow items-center px-1 py-1 group bg-[var(--pd-input-field-bg)] border-[1px] border-transparent {propsClass}"
    class:not(focus-within):hover:bg-[var(--pd-input-field-hover-bg)]={enabled}
    class:focus-within:bg-[var(--pd-input-field-focused-bg)]={enabled}
    class:focus-within:rounded-md={enabled}
    class:border-b-[var(--pd-input-field-stroke)]={enabled && !error}
    class:border-b-[var(--pd-input-field-stroke-error)]={enabled && error}
    class:hover:border-b-[var(--pd-input-field-hover-stroke)]={enabled && !error}
    class:hover:border-b-[var(--pd-input-field-stroke-error)]={enabled && error}
    class:focus-within:border-[var(--pd-input-field-hover-stroke)]={enabled && !error}
    class:focus-within:border-[var(--pd-input-field-stroke-error)]={enabled && error}
    class:border-b-[var(--pd-input-field-stroke-readonly)]={readonly || disabled}>
    {@render left?.()}
    <input
      bind:this={element}
      oninput={oninput}
      onkeypress={onkeypress}
      class="w-full px-0.5 outline-0 bg-[var(--pd-input-field-bg)] overflow-hidden {inputClass}"
      class:placeholder:text-[color:var(--pd-input-field-placeholder-text)]={!disabled}
      class:placeholder:text-[color:var(--pd-input-field-disabled-text)]={disabled}
      class:text-[color:var(--pd-input-field-focused-text)]={!disabled}
      class:text-[color:var(--pd-input-field-disabled-text)]={disabled}
      class:group-hover:bg-[var(--pd-input-field-hover-bg)]={enabled}
      class:group-focus-within:bg-[var(--pd-input-field-hover-bg)]={enabled}
      class:group-hover-placeholder:text-[color:var(--pd-input-field-placeholder-text)]={enabled}
      {name}
      type={type}
      {disabled}
      {readonly}
      {required}
      {placeholder}
      {id}
      {title}
      {min}
      {minlength}
      {max}
      {maxlength}
      {pattern}
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid ?? (error && showError ? true : undefined)}
      bind:value />
    {#if error && showError}
      <span class="px-0.5 text-[color:var(--pd-input-field-error-text)]" aria-hidden="true">
        <Icon icon={faCircleExclamation}/>
      </span>
    {/if}
    {#if clearable}
      <button
        class="px-0.5 cursor-pointer text-[color:var(--pd-input-field-icon)] group-hover:text-[color:var(--pd-input-field-hover-icon)] group-focus-within:text-[color:var(--pd-input-field-focused-icon)]"
        class:hidden={!value || disabled}
        aria-label="clear"
        onclick={onClear}
        type="button">
        <Icon icon={faXmark} />
      </button>
    {/if}
    {@render right?.()}
  </div>
  {#if error && error.length > 0 && showError}
    <span class="text-sm text-[color:var(--pd-input-field-error-text)]">{error}</span>
  {/if}
</div>
