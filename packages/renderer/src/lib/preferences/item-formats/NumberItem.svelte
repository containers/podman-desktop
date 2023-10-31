<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import Tooltip from '/@/lib/ui/Tooltip.svelte';
import { uncertainStringToNumber } from '../Util';
import { onMount } from 'svelte';

export let record: IConfigurationPropertyRecordedSchema;
export let value: number | undefined;
export let onChange = (_id: string, _value: number) => {};
export let invalidRecord = (_error: string) => {};

let valueUpdateTimeout: NodeJS.Timeout;

let recordValue: number;
$: recordValue = value || 0;

let numberInputErrorMessage = '';
let numberInputInvalid = false;

onMount(() => {
  if (value && assertNumericValueIsValid(value)) {
    recordValue = value;
  }
});

function onInput(event: Event) {
  clearTimeout(valueUpdateTimeout);
  const target = event.currentTarget as HTMLInputElement;

  const _value: number = uncertainStringToNumber(target.value);
  if (!assertNumericValueIsValid(_value)) {
    invalidRecord(numberInputErrorMessage);
    return;
  }

  if (record.id && _value !== value) {
    valueUpdateTimeout = setTimeout(() => onChange(record.id!, _value), 500);
  }
}

function onNumberInputKeyPress(event: any) {
  // if the key is not a number skip it
  if (isNaN(Number(event.key))) {
    event.preventDefault();
  }
}

function onDecrement(
  e: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  },
) {
  clearTimeout(valueUpdateTimeout);
  if (record.id && canDecrement()) {
    recordValue -= 1;
    valueUpdateTimeout = setTimeout(() => onChange(record.id!, recordValue), 500);
  }
  e.preventDefault();
}

function onIncrement(
  e: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  },
) {
  clearTimeout(valueUpdateTimeout);
  if (record.id && canIncrement()) {
    recordValue += 1;
    valueUpdateTimeout = setTimeout(() => onChange(record.id!, recordValue), 500);
  }
  e.preventDefault();
}

function canDecrement() {
  return !record.minimum || recordValue > record.minimum;
}

function assertNumericValueIsValid(value: number) {
  if (isNaN(value)) {
    numberInputInvalid = true;
    numberInputErrorMessage = `Expecting a number. The value cannot be less than ${record.minimum}${
      record.maximum ? ` or greater than ${record.maximum}` : ''
    }`;
    return false;
  }

  if (record.maximum && typeof record.maximum === 'number' && value > record.maximum) {
    numberInputInvalid = true;
    numberInputErrorMessage = `The value cannot be greater than ${record.maximum}`;
    return false;
  }
  if (record.minimum && typeof record.minimum === 'number' && value < record.minimum) {
    numberInputInvalid = true;
    numberInputErrorMessage = `The value cannot be less than ${record.minimum}`;
    return false;
  }
  numberInputErrorMessage = '';
  numberInputInvalid = false;
  return true;
}
function canIncrement() {
  return !record.maximum || (typeof record.maximum === 'number' && recordValue < record.maximum);
}
</script>

<div
  class="flex flex-row rounded-sm bg-zinc-700 text-sm divide-x divide-charcoal-800 w-24 border-b"
  class:border-violet-500="{!numberInputInvalid}"
  class:border-red-500="{numberInputInvalid}">
  <button
    data-action="decrement"
    on:click="{onDecrement}"
    disabled="{!canDecrement()}"
    class="w-11 text-white {!canDecrement()
      ? 'bg-charcoal-600 text-charcoal-100 border-t border-l border-charcoal-800'
      : 'hover:text-gray-900 hover:bg-gray-700'} cursor-pointer outline-none">
    <span class="m-auto font-thin">−</span>
  </button>
  <Tooltip topLeft tip="{numberInputErrorMessage}">
    <input
      type="text"
      class="w-[50px] outline-none focus:outline-none text-center text-white text-sm py-0.5"
      name="{record.id}"
      bind:value="{recordValue}"
      on:keypress="{event => onNumberInputKeyPress(event)}"
      on:input="{onInput}"
      aria-label="{record.description}" />
  </Tooltip>
  <button
    data-action="increment"
    on:click="{onIncrement}"
    disabled="{!canIncrement()}"
    class="w-11 text-white {!canIncrement()
      ? 'bg-charcoal-600 text-charcoal-100 border-t border-l border-charcoal-800'
      : 'hover:text-gray-900 hover:bg-gray-700'} cursor-pointer outline-none">
    <span class="m-auto font-thin">+</span>
  </button>
</div>
