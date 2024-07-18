<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import { uncertainStringToNumber } from '../Util';
import { checkNumericValueValid } from './NumberItemUtils';

export let record: IConfigurationPropertyRecordedSchema;
export let value: number | undefined;
export let onChange = (_id: string, _value: number) => {};
export let invalidRecord = (_error: string) => {};

let recordValue: string;
$: recordValue = value?.toString() ?? '0';

let numberInputErrorMessage = '';
let numberInputInvalid = false;

onMount(() => {
  if (value && assertNumericValueIsValid(value)) {
    recordValue = value.toString();
  }
});

function onInput(event: Event) {
  const target = event.currentTarget as HTMLInputElement;
  // if last char is a dot, user is probably adding a decimal point
  if (target.value.endsWith('.')) {
    // if the length of the string is = 1 (the string consists of only the dot) or there are other dots in the string, it's an invalid value
    if (target.value.length === 1 || target.value.substring(0, target.value.length - 1).includes('.')) {
      return;
    } else {
      recordValue = target.value;
      return;
    }
  }
  // convert string to number
  const _value: number = uncertainStringToNumber(target.value);
  // if number is not valid (NaN), return
  if (!assertNumericValueIsValid(_value)) {
    invalidRecord(numberInputErrorMessage);
    return;
  }
  recordValue = _value.toString();
  // if the value is different from the original update
  if (record.id) {
    onChange(record.id, _value);
  }
}

function onNumberInputKeyPress(event: any) {
  if (event.key === '.' && (recordValue.length === 0 || recordValue.includes('.'))) {
    event.preventDefault();
  }
  // if the key is not a number skip it
  if (isNaN(Number(event.key)) && event.key !== '.') {
    event.preventDefault();
  }
}

function assertNumericValueIsValid(value: number): boolean {
  const numericValue = checkNumericValueValid(record, value);
  numberInputInvalid = !numericValue.valid;
  numberInputErrorMessage = numericValue.error ?? '';
  return numericValue.valid;
}
</script>

<div
  class="flex flex-row rounded-sm bg-zinc-700 text-sm divide-x divide-charcoal-800 w-24 border-b"
  class:border-violet-500={!numberInputInvalid}
  class:border-red-500={numberInputInvalid}>
  <Tooltip topRight tip={numberInputErrorMessage}>
    <input
      type="text"
      class="w-full px-2 outline-none focus:outline-none text-white text-sm py-0.5"
      name={record.id}
      bind:value={recordValue}
      on:keypress={event => onNumberInputKeyPress(event)}
      on:input={onInput}
      aria-label={record.description} />
  </Tooltip>
</div>
