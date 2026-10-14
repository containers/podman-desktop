<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { Input } from '@podman-desktop/ui-svelte';

interface Props {
  record: IConfigurationPropertyRecordedSchema;
  value?: string;
  onChange?: (_id: string, _value: string) => Promise<void>;
}
let {
  record,
  value = $bindable(),
  onChange = async (_id: string, _value: string): Promise<void> => {},
}: Props = $props();

let invalidEntry = $state(false);

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (record.id && target.value !== value) {
    onChange(record.id, target.value).catch((_: unknown) => (invalidEntry = true));
  }
}
</script>

<Input
  on:input={onInput}
  class="grow"
  name={record.id}
  placeholder={record.placeholder}
  value={value}
  readonly={!!record.readonly || !!record.locked}
  id="input-standard-{record.id}"
  aria-invalid={invalidEntry}
  aria-label={record.description} />
