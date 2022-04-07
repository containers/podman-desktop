<script lang="ts">
import { onMount } from 'svelte';

import {
  ConfigurationRegistry,
  IConfigurationPropertyRecordedSchema,
} from '../../../../preload/src/configuration-registry';

let recordValue = '';
let invalidEntry = false;
let invalidText = undefined;

export let record: IConfigurationPropertyRecordedSchema;

onMount(async () => {
  if (record.scope === ConfigurationRegistry.DEFAULT_SCOPE) {
    try {
      recordValue = window.getConfigurationValue(record.id, record.scope);
    } catch (err) {
      console.error('Error getting configuration value', err);
    }
  }
});

function checkValue(record: IConfigurationPropertyRecordedSchema, event: any) {
  const userValue = event.target.value;
  if (record.type === 'number') {
    const numberValue = parseFloat(userValue);
    if (userValue === '') {
      invalidEntry = true;
      invalidText = `Expecting a number`;
      return;
    }
    if (isNaN(numberValue)) {
      invalidEntry = true;
      invalidText = `${userValue} is not a number`;
      return;
    }

    // check range
    if (record.minimum && numberValue < record.minimum) {
      invalidEntry = true;
      invalidText = 'Minimun value is ' + record.minimum;
      return;
    }
    if (record.maximum && numberValue > record.maximum) {
      invalidEntry = true;
      invalidText = 'Maximum value is ' + record.maximum;
      return;
    }
  }

  invalidEntry = false;
  invalidText = undefined;
}

function update(record: IConfigurationPropertyRecordedSchema) {
  // reset invalid
  invalidEntry = false;

  let value: any = recordValue;
  if (record.type === 'number') {
    value = parseFloat(value);
  }

  // save the value
  try {
    window.updateConfigurationValue(record.id, value, record.scope);
  } catch (error) {
    invalidEntry = true;
    invalidText = error;
  }
}
</script>

<div class="flex flex-row mb-2 px-4">
  <div class="flex flex-col mx-2 flex-1 pf-c-form__group-control">
    <input
      on:input="{event => checkValue(record, event)}"
      class="pf-c-form-control"
      type="text"
      bind:value="{recordValue}"
      readonly="{!!record.readonly}"
      id="input-standard"
      aria-invalid="{invalidEntry}"
      aria-label="{record.description}" />
    {#if invalidEntry}
      <p class="pf-c-form__helper-text pf-m-error text:red" id="form-help-text-address-helper" aria-live="polite">
        {invalidText}.
      </p>
    {/if}
  </div>
  {#if !!record.readonly === false && !invalidEntry}
    <button on:click="{() => update(record)}" class="pf-c-button pf-m-primary w-40 px-4" type="button">
      <span class="pf-c-button__icon pf-m-start">
        <i class="fas fa-save" aria-hidden="true"></i>
      </span>
      Update
    </button>
  {/if}
</div>
