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
export let type: 'number' | 'integer';
export let step: number | undefined = undefined;

// callback after validation occurs
export let onValidation = (_value: number, _error?: string) => {};

let minimumEnabled: boolean;
let maximumEnabled: boolean;
$: valueAsString = value !== undefined ? String(value) : undefined;

$: if (valueAsString !== undefined || disabled) {
  validateNumber();
}

function validateNumber() {
  const numberToValidate = Number(valueAsString);
  if (maximum !== undefined && numberToValidate > maximum) {
    error = `The value cannot be greater than ${maximum}`;
  } else if (minimum !== undefined && numberToValidate < minimum) {
    error = `The value cannot be less than ${minimum}`;
  } else {
    error = undefined;
  }
  minimumEnabled = !disabled && (minimum === undefined || minimum < numberToValidate);
  maximumEnabled = !disabled && (maximum === undefined || maximum > numberToValidate);

  // update converted value
  value = numberToValidate;
  // send the callback
  onValidation(numberToValidate, error);
}

function onKeyPress(event: any) {
  // Numbers with a zero fractional part are considered integers
  // see https://json-schema.org/understanding-json-schema/reference/numeric

  // get cursor position
  const cursorPosition = event.target.selectionStart;

  // add the new character to the cursor position
  const wantedValue = `${event.target.value.slice(0, cursorPosition)}${event.key}${event.target.value.slice(cursorPosition)}`;

  // now, check if type is integer if the value is value without digits or with zero fractional part
  if (type === 'integer' && Number.isInteger(Number(wantedValue))) {
    return;
  } else if (type === 'number' && !isNaN(Number(wantedValue))) {
    return;
  } else {
    // else prevent to use that key
    event.preventDefault();
  }
}

// handle float precision when adding floating point numbers
function precision(value: number, incrementOrDecrement: number): number {
  const valuePrecisionDigits = value.toString().split('.')[1]?.length ?? 0;
  const stepPrecisionDigits = incrementOrDecrement.toString().split('.')[1]?.length ?? 0;
  // use as precision either the value precision or the step precision
  const precisionDigits = Math.max(valuePrecisionDigits, stepPrecisionDigits);

  // if incrementOrDecrement is negative, it will decrement
  return Number((Number(value) + incrementOrDecrement).toFixed(precisionDigits));
}

function onDecrement(e: MouseEvent) {
  const dec = step ? step : 1;
  e.preventDefault();
  value = precision(value, -dec);
}

function onIncrement(e: MouseEvent) {
  const inc = step ? step : 1;
  e.preventDefault();
  value = precision(value, inc);
}
</script>

<Input
  class={$$props.class || ''}
  inputClass="text-center"
  name={name}
  bind:value={valueAsString}
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
