<script lang="ts">
import { faCaretDown, faCheck } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

export let id: string | undefined = undefined;
export let name: string | undefined = undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let value: any = '';
export let disabled: boolean = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let onInput: (val: any) => void = () => {};

interface Option {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  label: string;
}

let opened: boolean = false;
let selectLabel: string = '';
let options: Option[] = [];
let highlightIndex: number = -1;
let pageStep: number = 10;
let comp: HTMLElement;

$: selectLabel = options.find(o => o.value === value)?.label ?? value;

function onKeyDown(e: KeyboardEvent): void {
  switch (e.key) {
    case 'ArrowDown':
      onDownKey(e);
      break;
    case 'PageDown':
      onPageDownKey(e);
      break;
    case 'ArrowUp':
      onUpKey(e);
      break;
    case 'PageUp':
      onPageUpKey(e);
      break;
    case 'Escape':
      onEscKey(e);
      break;
    case 'Enter':
      onEnterKey(e);
      break;
  }
}

function onUpKey(e: KeyboardEvent): void {
  if (opened) {
    if (highlightIndex > 0) {
      highlightIndex--;
    } else if (highlightIndex === 0) {
      highlightIndex = -1;
      close();
    }
  }
  e.preventDefault();
}

function onPageUpKey(e: KeyboardEvent): void {
  if (opened) {
    highlightIndex = Math.max(0, highlightIndex - pageStep);
    e.preventDefault();
  }
}

function onDownKey(e: KeyboardEvent): void {
  if (opened) {
    if (highlightIndex < options.length - 1) {
      highlightIndex++;
    }
  } else {
    open();
  }
  e.preventDefault();
}

function onPageDownKey(e: KeyboardEvent): void {
  if (opened) {
    highlightIndex = Math.min(options.length - 1, highlightIndex + pageStep);
    e.preventDefault();
  }
}

function onEscKey(e: KeyboardEvent): void {
  if (opened) {
    close();
    e.stopPropagation();
  }
}

function onEnterKey(e: KeyboardEvent): void {
  if (opened && highlightIndex >= 0) {
    onSelect(e, options[highlightIndex].value);
    e.stopPropagation();
  } else {
    close();
  }
}

function onEnter(i: number): void {
  highlightIndex = i;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onSelect(e: Event, newValue: any): void {
  onInput(newValue);
  value = newValue;
  close();
  e.preventDefault();
}

function toggleOpen(): void {
  if (opened) {
    close();
  } else {
    open();
  }
}

function open(): void {
  opened = true;
  highlightIndex = 0;
}

function close(): void {
  opened = false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildOptions(node: HTMLSelectElement): any {
  options = [...node.options].map(o => ({ value: o.value, label: o.textContent ?? '' }));
  return {
    destroy(): void {
      options = [];
    },
  };
}

function onWindowClick(e: Event): void {
  if (opened && e.target instanceof Node && !comp.contains(e.target)) {
    close();
  }
}
</script>

<svelte:window on:click={onWindowClick} />

<div
  class="flex flex-row grow items-center px-1 py-1 group bg-[var(--pd-input-field-bg)] border-[1px] border-transparent min-w-24 relative {$$props.class ||
    ''}"
  class:not(focus-within):hover:bg-[var(--pd-input-field-hover-bg)]={!disabled}
  class:focus-within:bg-[var(--pd-input-field-focused-bg)]={!disabled}
  class:focus-within:rounded-md={!disabled}
  class:focus-within:border-[var(--pd-input-field-hover-stroke)]={!disabled}
  class:border-b-[var(--pd-input-field-stroke)]={!disabled}
  class:hover:border-b-[var(--pd-input-field-hover-stroke)]={!disabled}
  class:border-b-[var(--pd-input-field-stroke-readonly)]={disabled}
  aria-invalid={$$props['aria-invalid']}
  aria-label={$$props['aria-label']}
  bind:this={comp}>
  <button
    class="flex flex-row w-full outline-0 bg-[var(--pd-input-field-bg)] placeholder:text-[color:var(--pd-input-field-placeholder-text)] items-center text-start"
    class:text-[color:var(--pd-input-field-focused-text)]={!disabled}
    class:text-[color:var(--pd-input-field-disabled-text)]={disabled}
    class:group-hover:bg-[var(--pd-input-field-hover-bg)]={!disabled}
    class:group-focus-within:bg-[var(--pd-input-field-hover-bg)]={!disabled}
    class:group-hover-placeholder:text-[color:var(--pd-input-field-placeholder-text)]={!disabled}
    disabled={disabled}
    id={id}
    name={name}
    on:click={toggleOpen}
    on:keydown={onKeyDown}>
    <span class="grow">{selectLabel}</span>
    <div
      class:text-[var(--pd-input-field-stroke)]={!disabled}
      class:text-[var(--pd-input-field-disabled-text)]={!disabled}
      class:group-hover:text-[var(--pd-input-field-hover-stroke)]={!disabled}>
      <Fa icon={faCaretDown} />
    </div>
  </button>

  {#if opened}
    <div
      class="absolute top-full right-0 z-10 w-full max-h-80 rounded-md bg-[var(--pd-dropdown-bg)] border-[var(--pd-input-field-hover-stroke)] border-[1px] overflow-y-auto whitespace-nowrap">
      {#each options as option, i}
        <button
          on:keydown={onKeyDown}
          on:mouseenter={(): void => onEnter(i)}
          on:click={(e): void => onSelect(e, option.value)}
          class="flex flex-row w-full select-none px-2 py-1 items-center text-start"
          class:autofocus={i === 0}
          class:bg-[var(--pd-dropdown-item-hover-bg)]={highlightIndex === i}
          class:text-[var(--pd-dropdown-item-hover-text)]={highlightIndex === i}>
          <div class="min-w-4 max-w-4">
            {#if option.value === value}<Fa icon={faCheck} />{/if}
          </div>
          <div class="grow">{option.label}</div>
        </button>
      {/each}
    </div>
  {/if}

  <select use:buildOptions class="hidden" bind:value={value}>
    <slot />
  </select>
</div>
