<script lang="ts">
import { Input } from '@podman-desktop/ui-svelte';

export let name: string | undefined = undefined;
export let value: number;
export let required: boolean = false;
export let disabled: boolean = false;
export let minimum: number | undefined = undefined;
export let maximum: number | undefined = undefined;
export let error: string | undefined = undefined;
export let showError: boolean = true;

let minimumEnabled: boolean;
let maximumEnabled: boolean;

$: if (value !== undefined || disabled) {
  validateNumber();
}

function validateNumber() {
  if (maximum !== undefined && value > maximum) {
    error = `The value cannot be greater than ${maximum}`;
  } else if (minimum !== undefined && value < minimum) {
    error = `The value cannot be less than ${minimum}`;
  } else {
    error = undefined;
  }
  minimumEnabled = !disabled && (minimum === undefined || minimum < value);
  maximumEnabled = !disabled && (maximum === undefined || maximum > value);
}

function onKeyPress(event: any) {
  if (isNaN(Number(event.key))) {
    event.preventDefault();
  }
}

function onDecrement(e: MouseEvent) {
  e.preventDefault();
  value = Number(value) - 1;
}

function onIncrement(e: MouseEvent) {
  e.preventDefault();
  value = Number(value) + 1;
}
</script>

<Input
  class={$$props.class || ''}
  inputClass="text-center"
  name={name}
  bind:value={value}
  on:keypress={event => onKeyPress(event)}
  on:input
  showError={showError}
  error={error}
  disabled={disabled}
  required={required}
  aria-label={$$props['aria-label']}
  aria-invalid={$$props['aria-invalid']}>
  <button
    class="pr-0.5"
    class:text-[var(--pd-input-field-stroke)]={minimumEnabled}
    class:text-[var(--pd-input-field-disabled-text)]={!minimumEnabled}
    class:group-hover:text-[var(--pd-input-field-hover-stroke)]={minimumEnabled}
    data-action="decrement"
    aria-label="decrement"
    on:click={onDecrement}
    disabled={!minimumEnabled}
    slot="left">-</button>
  <button
    class="pl-0.5"
    class:text-[var(--pd-input-field-stroke)]={maximumEnabled}
    class:text-[var(--pd-input-field-disabled-text)]={!maximumEnabled}
    class:group-hover:text-[var(--pd-input-field-hover-stroke)]={maximumEnabled}
    data-action="increment"
    aria-label="increment"
    on:click={onIncrement}
    disabled={!maximumEnabled}
    slot="right">+</button>
</Input>
