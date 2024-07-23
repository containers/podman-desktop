<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import NumberInput from '../../ui/NumberInput.svelte';

export let record: IConfigurationPropertyRecordedSchema;
export let value: number | undefined;
export let onChange = (_id: string, _value: number) => {};
export let invalidRecord = (_error: string) => {};

let valueUpdateTimeout: NodeJS.Timeout;

let recordValue: number = value ?? 0;
let lastValue: number;
let error: string | undefined = undefined;

$: recordValue = value ?? 0;

$: if (recordValue) {
  const newValue = Number(recordValue);
  // if the value is different from the original update
  if (record.id && newValue !== lastValue && !error) {
    // clear the timeout so if there was an old call to onChange pending is deleted. We will create a new one soon
    clearTimeout(valueUpdateTimeout);

    valueUpdateTimeout = setTimeout(() => {
      onChange(record.id!, newValue);
      lastValue = newValue;
    }, 500);
  }
}

$: if (error) {
  invalidRecord(error);
}
</script>

<Tooltip topLeft tip={error}>
  <NumberInput
    class="w-24"
    name={record.id}
    bind:value={recordValue}
    bind:error={error}
    aria-label={record.description}
    minimum={record.minimum}
    maximum={record.maximum && typeof record.maximum === 'number' ? record.maximum : undefined}
    showError={false}>
  </NumberInput>
</Tooltip>
