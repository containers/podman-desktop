<script lang="ts">
import { faCircleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa';

export let placeholder: string | undefined = undefined;
export let id: string | undefined = undefined;
export let name: string | undefined = undefined;
export let value: string | number | undefined = undefined;
export let readonly: boolean = false;
export let required: boolean = false;
export let clearable: boolean = false;
export let disabled: boolean = false;
export let error: string | undefined = undefined;
export let inputClass: string | undefined = undefined;
export let showError: boolean = true;

export let element: HTMLInputElement | undefined = undefined;

let enabled: boolean = true;
$: enabled = !readonly && !disabled;

const dispatch = createEventDispatcher();

// clear the value if the parent doesn't override
async function onClear(): Promise<void> {
  if (dispatch('action', { cancelable: true })) {
    value = '';
    if (element) {
      // need to trigger normal input event for on:input listeners
      element.value = value;
      element.dispatchEvent(new InputEvent('input'));
    }
  }
}
</script>

<div class="flex flex-col grow">
  <div
    class="flex flex-row grow items-center px-1 py-1 group bg-[var(--pd-input-field-bg)] border-[1px] border-transparent {$$props.class ||
      ''}"
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
    <slot name="left" />
    <input
      bind:this={element}
      on:input
      on:keypress
      class="grow px-0.5 outline-0 bg-[var(--pd-input-field-bg)] placeholder:text-[color:var(--pd-input-field-placeholder-text)] overflow-hidden {inputClass ??
        ''}"
      class:text-[color:var(--pd-input-field-focused-text)]={!disabled}
      class:text-[color:var(--pd-input-field-disabled-text)]={disabled}
      class:group-hover:bg-[var(--pd-input-field-hover-bg)]={enabled}
      class:group-focus-within:bg-[var(--pd-input-field-hover-bg)]={enabled}
      class:group-hover-placeholder:text-[color:var(--pd-input-field-placeholder-text)]={enabled}
      name={name}
      type="text"
      disabled={disabled}
      readonly={readonly}
      required={required}
      placeholder={placeholder}
      id={id}
      aria-label={$$props['aria-label']}
      aria-invalid={$$props['aria-invalid']}
      bind:value={value} />
    {#if error && showError}
      <span class="px-0.5 text-[color:var(--pd-input-field-error-text)]" aria-label="error">
        <Fa icon={faCircleExclamation} />
      </span>
    {/if}
    {#if clearable}
      <button
        class="px-0.5 cursor-pointer text-[color:var(--pd-input-field-icon)] group-hover:text-[color:var(--pd-input-field-hover-icon)] group-focus-within:text-[color:var(--pd-input-field-focused-icon)]"
        class:hidden={!value || readonly || disabled}
        aria-label="clear"
        on:click={onClear}>
        <Fa icon={faXmark} />
      </button>
    {/if}
    <slot name="right" />
  </div>
  {#if error && error.length > 0 && showError}
    <span class="text-sm text-[color:var(--pd-input-field-error-text)]">{error}</span>
  {/if}
</div>
