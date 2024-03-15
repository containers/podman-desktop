<script lang="ts">
import { onMount } from 'svelte';

import Tooltip from '/@/lib/ui/Tooltip.svelte';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import { uncertainStringToNumber } from '../Util';
import { checkNumericValueValid } from './NumberItemUtils';

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
  // clear the timeout so if there was an old call to onChange pending is deleted. We will create a new one soon
  clearTimeout(valueUpdateTimeout);
  const target = event.currentTarget as HTMLInputElement;
  // convert string to number
  const _value: number = uncertainStringToNumber(target.value);
  // if number is not valid (NaN), return
  if (!assertNumericValueIsValid(_value)) {
    invalidRecord(numberInputErrorMessage);
    return;
  }
  recordValue = _value;
  // if the value is different from the original update
  if (record.id && recordValue !== value) {
    valueUpdateTimeout = setTimeout(() => onChange(record.id!, recordValue), 500);
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
  // clear the timeout so if there was an old call to onChange pending is deleted. We will create a new one soon
  clearTimeout(valueUpdateTimeout);
  // if we can decrement
  if (record.id && canDecrement(recordValue)) {
    // update record
    recordValue -= 1;
    // verify it is valid
    // it may happen that the value is greater than min but also greater than max so we need to check if we can update it
    if (assertNumericValueIsValid(recordValue)) {
      valueUpdateTimeout = setTimeout(() => onChange(record.id!, recordValue), 500);
    }
  }

  e.preventDefault();
}

function onIncrement(
  e: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  },
) {
  // clear the timeout so if there was an old call to onChange pending is deleted. We will create a new one soon
  clearTimeout(valueUpdateTimeout);
  // if we can increment
  if (record.id && canIncrement(recordValue)) {
    // update record
    recordValue += 1;
    // verify it is valid
    // it may happen that the value is less than max but also less than min so we need to check if we can update it
    if (assertNumericValueIsValid(recordValue)) {
      valueUpdateTimeout = setTimeout(() => onChange(record.id!, recordValue), 500);
    }
  }
  e.preventDefault();
}

function canDecrement(value: number) {
  return !record.minimum || value > record.minimum;
}

function assertNumericValueIsValid(value: number): boolean {
  const numericValue = checkNumericValueValid(record, value);
  numberInputInvalid = !numericValue.valid;
  numberInputErrorMessage = numericValue.error || '';
  return numericValue.valid;
}

function canIncrement(value: number) {
  return !record.maximum || (typeof record.maximum === 'number' && value < record.maximum);
}
</script>

<div
  class="flex flex-row rounded-sm bg-zinc-700 text-sm divide-x divide-charcoal-800 w-24 border-b"
  class:border-violet-500="{!numberInputInvalid}"
  class:border-red-500="{numberInputInvalid}">
  <button
    data-action="decrement"
    aria-label="decrement"
    on:click="{onDecrement}"
    disabled="{!canDecrement(recordValue)}"
    class="w-11 text-white {!canDecrement(recordValue)
      ? 'bg-charcoal-600 text-charcoal-100 border-t border-l border-charcoal-800'
      : 'hover:text-gray-900 hover:bg-gray-700'} cursor-pointer outline-none">
    <span class="m-auto font-thin">−</span>
  </button>
  <Tooltip topLeft tip="{numberInputErrorMessage}">
    <input
      type="text"
      class="w-[50px] outline-none focus:outline-none text-white text-center text-sm py-0.5 bg-transparent"
      name="{record.id}"
      bind:value="{recordValue}"
      on:keypress="{event => onNumberInputKeyPress(event)}"
      on:input="{onInput}"
      aria-label="{record.description}" />
  </Tooltip>
  <button
    data-action="increment"
    aria-label="increment"
    on:click="{onIncrement}"
    disabled="{!canIncrement(recordValue)}"
    class="w-11 text-white {!canIncrement(recordValue)
      ? 'bg-charcoal-600 text-charcoal-100 border-t border-l border-charcoal-800'
      : 'hover:text-gray-900 hover:bg-gray-700'} cursor-pointer outline-none">
    <span class="m-auto font-thin">+</span>
  </button>
</div>
