<script lang="ts">
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { CONFIGURATION_DEFAULT_SCOPE } from '../../../../main/src/plugin/configuration-registry-constants';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import Markdown from '../markdown/Markdown.svelte';
import { getNormalizedDefaultNumberValue, isDefaultScope } from './Util';
import Tooltip from '../ui/Tooltip.svelte';
import Button from '../ui/Button.svelte';

let invalidEntry = false;
let invalidText: string | undefined = undefined;
export let invalidRecord = (_error: string) => {};
export let validRecord = () => {};
export let updateResetButtonVisibility = (_recordValue: any) => {};
export let resetToDefault = false;
export let enableAutoSave = false;

export let setRecordValue = (_id: string, _value: string) => {};
export let enableSlider = false;
export let record: IConfigurationPropertyRecordedSchema;

let currentRecord: IConfigurationPropertyRecordedSchema;
let recordUpdateTimeout: NodeJS.Timeout;

let recordValue: any;
$: recordValue;
$: updateResetButtonVisibility?.(recordValue);
let checkboxValue = false;
$: if (resetToDefault) {
  recordValue = record.type === 'number' ? getNormalizedDefaultNumberValue(record) : record.default;
  if (typeof recordValue === 'boolean') {
    checkboxValue = recordValue;
  }
  update(record);
  resetToDefault = false;
}

$: if (currentRecord !== record) {
  if (isDefaultScope(record.scope)) {
    if (record.id) {
      window.getConfigurationValue(record.id, CONFIGURATION_DEFAULT_SCOPE).then(value => {
        recordValue = value;
        if (record.type === 'boolean') {
          recordValue = !!value;
          checkboxValue = recordValue;
        }
      });
    }
  } else if (record.default !== undefined) {
    recordValue = record.type === 'number' ? getNormalizedDefaultNumberValue(record) : record.default;
    if (record.type === 'boolean') {
      checkboxValue = recordValue;
    }
  }

  currentRecord = record;
  invalidText = undefined;
  invalidEntry = false;
}

function invalid() {
  // call the callback
  if (invalidText) {
    invalidRecord(invalidText);
  }
}

function valid() {
  validRecord();
}

function checkValue(record: IConfigurationPropertyRecordedSchema, event: any) {
  clearTimeout(recordUpdateTimeout);
  const userValue = event.target.value;
  if (record.type === 'number') {
    const numberValue = parseFloat(userValue);
    if (userValue === '') {
      invalidEntry = true;
      invalidText = 'Expecting a number';
      return invalid();
    }
    if (isNaN(numberValue)) {
      invalidEntry = true;
      invalidText = `${userValue} is not a number`;
      return invalid();
    }

    // check range
    if (record.minimum && numberValue < record.minimum) {
      invalidEntry = true;
      invalidText = 'Minimun value is ' + record.minimum;
      return invalid();
    }
    if (record.maximum && typeof record.maximum === 'number' && numberValue > record.maximum) {
      invalidEntry = true;
      invalidText = 'Maximum value is ' + record.maximum;
      return invalid();
    }
  }
  valid();
  autoSave();
  invalidEntry = false;
  invalidText = undefined;
}

function update(record: IConfigurationPropertyRecordedSchema) {
  // reset invalid
  invalidEntry = false;

  let value: any = recordValue;
  if (record.type === 'number') {
    value = parseFloat(value);
  } else if (record.type === 'boolean') {
    value = checkboxValue;
  }

  // save the value
  if (record.id) {
    try {
      window.updateConfigurationValue(record.id, value, record.scope);
    } catch (error) {
      invalidEntry = true;
      invalidText = String(error);
    }
  }
}

async function selectFilePath() {
  clearTimeout(recordUpdateTimeout);
  const result = await window.openFileDialog(`Select ${record.description}`);
  if (!result.canceled && result.filePaths.length === 1) {
    recordValue = result.filePaths[0];
    autoSave();
  }
}

function decrement(
  e: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  },
  record: IConfigurationPropertyRecordedSchema,
) {
  clearTimeout(recordUpdateTimeout);
  const target = getCurrentNumericInputElement(e.currentTarget);
  let value = Number(target.value);
  if (canDecrement(value, record.minimum)) {
    value--;
    recordValue = value;
    autoSave();
  }
  assertNumericValueIsValid(value);
  e.preventDefault();
}

function increment(
  e: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  },
  record: IConfigurationPropertyRecordedSchema,
) {
  clearTimeout(recordUpdateTimeout);
  const target = getCurrentNumericInputElement(e.currentTarget);
  let value = Number(target.value);
  if (canIncrement(value, record.maximum)) {
    value++;
    recordValue = value;
    autoSave();
  }
  assertNumericValueIsValid(value);
  e.preventDefault();
}

function autoSave() {
  if (enableAutoSave) {
    recordUpdateTimeout = setTimeout(() => update(record), 1000);
  }
}

function getCurrentNumericInputElement(e: HTMLButtonElement) {
  const btn = e.parentNode?.parentElement?.querySelector('button[data-action="decrement"]');
  return btn?.nextElementSibling?.firstElementChild?.firstElementChild as unknown as HTMLInputElement;
}

function canDecrement(value: number | string, minimumValue?: number) {
  if (typeof value === 'string') {
    value = Number(value);
  }
  return !minimumValue || value > minimumValue;
}

function canIncrement(value: number | string, maximumValue?: number | string) {
  if (typeof value === 'string') {
    value = Number(value);
  }
  return !maximumValue || (typeof maximumValue === 'number' && value < maximumValue);
}

function handleRangeValue(id: string | undefined, target: HTMLInputElement) {
  if (!id) {
    return;
  }
  setRecordValue(id, target.value);
}

function handleCleanValue(
  event: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  },
) {
  recordValue = '';
  event.preventDefault();
}

let numberInputInvalid = false;
let numberInputErrorMessage = '';
function onNumberInputKeyPress(event: any) {
  // if the key is not a number skip it
  if (isNaN(Number(event.key))) {
    event.preventDefault();
  }
}

function onNumberInputChange(event: any) {
  if (event.target.value === '') {
    numberInputInvalid = true;
    numberInputErrorMessage = `The value cannot be less than ${record.minimum}${
      record.maximum ? ` or greater than ${record.maximum}` : ''
    }`;
    clearTimeout(recordUpdateTimeout);
    return;
  }
  // if the resulting value is greater than the maximum or less than the minimum skip it
  const resultingValue = Number(event.target.value);
  if (assertNumericValueIsValid(resultingValue)) {
    autoSave();
  }
}

function assertNumericValueIsValid(value: number) {
  if (record.maximum && typeof record.maximum === 'number' && value > record.maximum) {
    numberInputInvalid = true;
    numberInputErrorMessage = `The value cannot be greater than ${record.maximum}`;
    clearTimeout(recordUpdateTimeout);
    return false;
  }
  if (record.minimum && typeof record.minimum === 'number' && value < record.minimum) {
    numberInputInvalid = true;
    numberInputErrorMessage = `The value cannot be less than ${record.minimum}`;
    clearTimeout(recordUpdateTimeout);
    return false;
  }
  numberInputErrorMessage = '';
  numberInputInvalid = false;
  return true;
}
</script>

<div class="flex flex-row mb-1 pt-2">
  <div class="flex flex-col text-start w-full justify-center items-start">
    {#if record.type === 'boolean'}
      <label class="relative inline-flex items-center cursor-pointer">
        <span class="text-xs {checkboxValue ? 'text-white' : 'text-gray-700'} mr-3"
          >{checkboxValue ? 'Enabled' : 'Disabled'}</span>
        <input
          on:input="{event => {
            recordValue = !checkboxValue;
            checkValue(record, event);
          }}"
          class="sr-only peer"
          bind:checked="{checkboxValue}"
          name="{record.id}"
          type="checkbox"
          readonly="{!!record.readonly}"
          id="input-standard-{record.id}"
          aria-invalid="{invalidEntry}"
          aria-label="{record.description || record.markdownDescription}" />
        <div
          class="w-8 h-[20px] bg-gray-900 rounded-full peer peer-checked:after:translate-x-full after:bg-charcoal-600 after:content-[''] after:absolute after:top-[4px] after:left-[61px] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600">
        </div>
      </label>
    {:else if enableSlider && record.type === 'number' && typeof record.maximum === 'number'}
      <input
        id="input-slider-{record.id}"
        type="range"
        name="{record.id}"
        min="{record.minimum}"
        max="{record.maximum}"
        value="{getNormalizedDefaultNumberValue(record)}"
        aria-label="{record.description}"
        on:input="{event => handleRangeValue(record.id, event.currentTarget)}"
        class="w-full h-1 bg-purple-500 rounded-lg appearance-none accent-purple-500 cursor-pointer range-xs mt-2" />
    {:else if record.type === 'number'}
      <div
        class="flex flex-row rounded-sm bg-zinc-700 text-sm divide-x divide-charcoal-800 w-24 border-b"
        class:border-violet-500="{!numberInputInvalid}"
        class:border-red-500="{numberInputInvalid}">
        <button
          data-action="decrement"
          on:click="{e => decrement(e, record)}"
          disabled="{!canDecrement(recordValue, record.minimum)}"
          class="w-11 text-white {!canDecrement(recordValue, record.minimum)
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
            on:input="{event => onNumberInputChange(event)}"
            aria-label="{record.description}" />
        </Tooltip>
        <button
          data-action="increment"
          on:click="{e => increment(e, record)}"
          disabled="{!canIncrement(recordValue, record.maximum)}"
          class="w-11 text-white {!canIncrement(recordValue, record.maximum)
            ? 'bg-charcoal-600 text-charcoal-100 border-t border-l border-charcoal-800'
            : 'hover:text-gray-900 hover:bg-gray-700'} cursor-pointer outline-none">
          <span class="m-auto font-thin">+</span>
        </button>
      </div>
    {:else if record.type === 'string' && record.format === 'file'}
      <div class="w-full flex">
        <input
          class="grow {!recordValue ? 'mr-3' : ''} py-1 px-2 outline-0 text-sm placeholder-gray-900"
          name="{record.id}"
          readonly
          type="text"
          placeholder="{record.placeholder}"
          value="{recordValue || ''}"
          id="input-standard-{record.id}"
          aria-invalid="{invalidEntry}"
          aria-label="{record.description}" />
        <button
          class="relative cursor-pointer right-5"
          class:hidden="{!recordValue}"
          aria-label="clear"
          on:click="{event => handleCleanValue(event)}">
          <Fa icon="{faXmark}" />
        </button>
        <Button
          on:click="{() => selectFilePath()}"
          id="rendering.FilePath.{record.id}"
          aria-invalid="{invalidEntry}"
          aria-label="button-{record.description}">Browse ...</Button>
      </div>
    {:else if record.type === 'string' && record.enum && record.enum.length > 0}
      <select
        class="border-b block w-full p-1 bg-zinc-700 border-violet-500 text-white text-sm checked:bg-violet-50"
        name="{record.id}"
        id="input-standard-{record.id}"
        on:input="{event => checkValue(record, event)}"
        bind:value="{recordValue}"
        aria-invalid="{invalidEntry}"
        aria-label="{record.description}">
        {#each record.enum as recordEnum}
          <option value="{recordEnum}">{recordEnum}</option>
        {/each}
      </select>
    {:else if record.type === 'markdown'}
      <div class="text-sm">
        <Markdown>{record.markdownDescription}</Markdown>
      </div>
    {:else}
      <input
        on:input="{event => checkValue(record, event)}"
        class="grow py-1 px-2 w-full outline-0 border-b-2 border-gray-800 hover:border-violet-500 focus:border-violet-500 placeholder-gray-900"
        name="{record.id}"
        type="text"
        placeholder="{record.placeholder}"
        bind:value="{recordValue}"
        readonly="{!!record.readonly}"
        id="input-standard-{record.id}"
        aria-invalid="{invalidEntry}"
        aria-label="{record.description}" />
    {/if}

    {#if invalidEntry}
      <ErrorMessage error="{invalidText}." />
    {/if}
  </div>
</div>
