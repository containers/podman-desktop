<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { Dropdown } from '@podman-desktop/ui-svelte';

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

function onChangeHandler(newValue: unknown): void {
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
  ariaLabel={record.description}
  disabled={!!record.readonly || !!record.locked}
  options={record.enum?.map(recordEnum => ({label: recordEnum, value: recordEnum}))}>
</Dropdown>
