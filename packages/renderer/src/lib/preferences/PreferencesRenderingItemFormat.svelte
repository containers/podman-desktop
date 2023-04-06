<script lang="ts">
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { CONFIGURATION_DEFAULT_SCOPE } from '../../../../main/src/plugin/configuration-registry-constants';
import ErrorMessage from '../ui/ErrorMessage.svelte';

let invalidEntry = false;
let invalidText = undefined;
export let showUpdate = false;
export let invalidRecord = (error: string) => {};
export let validRecord = () => {};
export let updateResetButtonVisibility = (recordValue: any) => {};
export let resetToDefault = false;

export let setRecordValue = (id: string, value: string) => {};
export let enableSlider = false;
export let record: IConfigurationPropertyRecordedSchema;

let currentRecord: IConfigurationPropertyRecordedSchema;
let recordUpdateTimeout: NodeJS.Timeout;

let recordValue: any;
$: recordValue;
$: updateResetButtonVisibility && updateResetButtonVisibility(recordValue);
let checkboxValue: boolean = false;
$: if (resetToDefault) {
  recordValue = record.default;
  if (typeof recordValue === 'boolean') {
    checkboxValue = recordValue;
  }
  update(record);
  resetToDefault = false;
}

$: if (currentRecord !== record) {
  if (record.scope === CONFIGURATION_DEFAULT_SCOPE) {
    window.getConfigurationValue(record.id, record.scope).then(value => {
      recordValue = value;
      if (record.type === 'boolean') {
        recordValue = !!value;
        checkboxValue = recordValue;
      }
    });
  } else if (record.default !== undefined) {
    recordValue = record.default;
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
  invalidRecord(invalidText);
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
      invalidText = `Expecting a number`;
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
  recordUpdateTimeout = setTimeout(() => update(record), 1000);
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
  try {
    window.updateConfigurationValue(record.id, value, record.scope);
  } catch (error) {
    invalidEntry = true;
    invalidText = error;
  }
}

async function selectFilePath() {
  clearTimeout(recordUpdateTimeout);
  const result = await window.openFileDialog(`Select ${record.description}`);
  if (!result.canceled && result.filePaths.length === 1) {
    recordValue = result.filePaths[0];
    recordUpdateTimeout = setTimeout(() => update(record), 1000);
  }
}

function decrement(e: HTMLButtonElement, record: IConfigurationPropertyRecordedSchema) {
  clearTimeout(recordUpdateTimeout);
  const target = getCurrentNumericInputElement(e);
  let value = Number(target.value);
  if (canDecrement(value, record.minimum)) {
    value--;
    recordValue = value;
    recordUpdateTimeout = setTimeout(() => update(record), 1000);
  }
}

function increment(e: HTMLButtonElement, record: IConfigurationPropertyRecordedSchema) {
  clearTimeout(recordUpdateTimeout);
  const target = getCurrentNumericInputElement(e);
  let value = Number(target.value);
  if (canIncrement(value, record.maximum)) {
    value++;
    recordValue = value;
    recordUpdateTimeout = setTimeout(() => update(record), 1000);
  }
}

function getCurrentNumericInputElement(e: HTMLButtonElement) {
  const btn = e.parentNode.parentElement.querySelector('button[data-action="decrement"]');
  return btn.nextElementSibling as unknown as HTMLInputElement;
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

function handleRangeValue(id: string, target: HTMLInputElement) {
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
</script>

<div class="flex flex-row mb-1 pt-2">
  <div class="flex flex-col mx-2 text-start w-full justify-center items-start pf-c-form__group-control">
    {#if record.type === 'boolean'}
      <label class="relative inline-flex items-center cursor-pointer">
        <span class="text-xs {checkboxValue ? 'text-white' : 'text-gray-400'} mr-3"
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
          aria-label="{record.description}" />
        <div
          class="w-8 h-[20px] bg-gray-500 rounded-full peer peer-checked:after:translate-x-full after:bg-zinc-800 after:content-[''] after:absolute after:top-[4px] after:left-[61px] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600">
        </div>
      </label>
    {:else if enableSlider && record.type === 'number' && typeof record.maximum === 'number'}
      <input
        id="input-slider-{record.id}"
        type="range"
        min="{record.minimum}"
        max="{record.maximum}"
        value="{record.default}"
        on:input="{event => handleRangeValue(record.id, event.currentTarget)}"
        class="w-full h-1 bg-[var(--pf-global--primary-color--300)] rounded-lg appearance-none accent-[var(--pf-global--primary-color--300)] cursor-pointer range-xs" />
    {:else if record.type === 'number'}
      <div
        class="flex flex-row rounded-sm bg-zinc-700 text-sm divide-x divide-zinc-900 w-24 border-b border-violet-500">
        <button
          data-action="decrement"
          on:click="{e => decrement(e.currentTarget, record)}"
          disabled="{!canDecrement(recordValue, record.minimum)}"
          class="w-11 text-white {!canDecrement(recordValue, record.minimum)
            ? 'bg-charcoal-600 text-charcoal-100 border-t border-l border-zinc-900'
            : 'hover:text-gray-700 hover:bg-gray-400'} cursor-pointer outline-none">
          <span class="m-auto font-thin">−</span>
        </button>
        <input
          type="text"
          readonly
          class="w-full outline-none focus:outline-none text-center text-white text-sm py-0.5"
          value="{recordValue}" />
        <button
          data-action="increment"
          on:click="{e => increment(e.currentTarget, record)}"
          disabled="{!canIncrement(recordValue, record.maximum)}"
          class="w-11 text-white {!canIncrement(recordValue, record.maximum)
            ? 'bg-charcoal-600 text-charcoal-100 border-t border-l border-zinc-900'
            : 'hover:text-gray-700 hover:bg-gray-400'} cursor-pointer outline-none">
          <span class="m-auto font-thin">+</span>
        </button>
      </div>
    {:else if record.type === 'string' && record.format === 'file'}
      <div class="w-full flex">
        <input
          class="grow {!recordValue ? 'mr-3' : ''} py-1 px-2 outline-0 text-sm"
          name="{record.id}"
          readonly
          type="text"
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
        <input
          name="{record.id}"
          on:click="{() => selectFilePath()}"
          id="rendering.FilePath.{record.id}"
          readonly
          aria-invalid="{invalidEntry}"
          aria-label="{record.description}"
          placeholder="Browse ..."
          class="bg-violet-500 p-1 text-xs text-center hover:bg-zinc-700 placeholder-white rounded-sm cursor-pointer outline-0"
          required />
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
    {:else}
      <input
        on:input="{event => checkValue(record, event)}"
        class="pf-c-form-control outline-0"
        name="{record.id}"
        type="text"
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
  {#if showUpdate}
    {#if !!record.readonly === false && !invalidEntry}
      <button on:click="{() => update(record)}" class="pf-c-button pf-m-primary w-40 px-4" type="button">
        <span class="pf-c-button__icon pf-m-start">
          <i class="fas fa-save" aria-hidden="true"></i>
        </span>
        Update
      </button>
    {/if}
  {/if}
</div>
