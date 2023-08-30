<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import Tooltip from '/@/lib/ui/Tooltip.svelte';
import { uncertainStringToNumber } from '../Util';

export let record: IConfigurationPropertyRecordedSchema;
export let value: number;
export let onChange = (_id: string, _value: number) => {};
export let invalidRecord = (_error: string) => {};

let numberInputInvalid = false;
let numberInputErrorMessage = '';

function onInput(event: Event) {
  numberInputInvalid = false;
  const target = event.currentTarget as HTMLInputElement;

  const _value: number = uncertainStringToNumber(target.value);
  if (!assertNumericValueIsValid(_value)) {
    invalidRecord(numberInputErrorMessage);
    return;
  }

  if (_value !== value) {
    onChange(record.id, _value);
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
  onChange(record.id, value - 1);
  e.preventDefault();
}

function onIncrement(
  e: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  },
) {
  onChange(record.id, value + 1);
  e.preventDefault();
}

function canDecrement(minimumValue?: number) {
  return !minimumValue || value > minimumValue;
}

function assertNumericValueIsValid(value: number) {
  if (isNaN(value)) {
    numberInputInvalid = true;
    numberInputErrorMessage = 'Expecting a number';
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
function canIncrement(maximumValue?: number | string) {
  return !maximumValue || (typeof maximumValue === 'number' && value < maximumValue);
}
</script>

<div
  class="flex flex-row rounded-sm bg-zinc-700 text-sm divide-x divide-charcoal-800 w-24 border-b"
  class:border-violet-500="{!numberInputInvalid}"
  class:border-red-500="{numberInputInvalid}">
  <button
    data-action="decrement"
    on:click="{onDecrement}"
    disabled="{!canDecrement(record.minimum)}"
    class="w-11 text-white {!canDecrement(record.minimum)
      ? 'bg-charcoal-600 text-charcoal-100 border-t border-l border-charcoal-800'
      : 'hover:text-gray-900 hover:bg-gray-700'} cursor-pointer outline-none">
    <span class="m-auto font-thin">−</span>
  </button>
  <Tooltip topLeft tip="{numberInputErrorMessage}">
    <input
      type="text"
      class="w-[50px] outline-none focus:outline-none text-center text-white text-sm py-0.5"
      name="{record.id}"
      bind:value="{value}"
      on:keypress="{event => onNumberInputKeyPress(event)}"
      on:input="{onInput}"
      aria-label="{record.description}" />
  </Tooltip>
  <button
    data-action="increment"
    on:click="{onIncrement}"
    disabled="{!canIncrement(record.maximum)}"
    class="w-11 text-white {!canIncrement(record.maximum)
      ? 'bg-charcoal-600 text-charcoal-100 border-t border-l border-charcoal-800'
      : 'hover:text-gray-900 hover:bg-gray-700'} cursor-pointer outline-none">
    <span class="m-auto font-thin">+</span>
  </button>
</div>
