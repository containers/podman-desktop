<script lang="ts">
import { Dropdown } from '@podman-desktop/ui-svelte';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';

export let record: IConfigurationPropertyRecordedSchema;
export let value: string | undefined;
export let onChange = async (_id: string, _value: string) => {};

let invalidEntry = false;

function onChangeHandler(newValue: unknown) {
  invalidEntry = false;
  if (record.id && newValue !== value) {
    onChange(record.id, newValue as string).catch((_: unknown) => (invalidEntry = true));
  }
}
</script>

<Dropdown
  name={record.id}
  id="input-standard-{record.id}"
  onChange={onChangeHandler}
  bind:value={value}
  ariaInvalid={invalidEntry}
  ariaLabel={record.description}>
  {#if record.enum}
    {#each record.enum as recordEnum}
      <option class="bg-[var(--pd-input-field-focused-bg)]" value={recordEnum}>{recordEnum}</option>
    {/each}
  {/if}
</Dropdown>
