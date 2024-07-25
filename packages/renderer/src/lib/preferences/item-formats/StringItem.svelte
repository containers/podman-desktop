<script lang="ts">
import { Input } from '@podman-desktop/ui-svelte';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';

export let record: IConfigurationPropertyRecordedSchema;
export let value: string | undefined;
export let onChange = async (_id: string, _value: string) => {};

let invalidEntry = false;

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (record.id && target.value !== value)
    onChange(record.id, target.value).catch((_: unknown) => (invalidEntry = true));
}
</script>

<Input
  on:input={onInput}
  class="grow"
  name={record.id}
  placeholder={record.placeholder}
  bind:value={value}
  readonly={!!record.readonly}
  id="input-standard-{record.id}"
  aria-invalid={invalidEntry}
  aria-label={record.description} />
