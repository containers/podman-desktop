<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';

import PasswordInput from '/@/lib/ui/PasswordInput.svelte';

interface Props {
  record: IConfigurationPropertyRecordedSchema;
  value: string | undefined;
  onChange: (id: string, value: string) => Promise<void>;
}

let { record, value, onChange }: Props = $props();

let invalidEntry = $state(false);

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (record.id && target.value !== value)
    onChange(record.id, target.value).catch((_: unknown) => (invalidEntry = true));
}
</script>

<PasswordInput
  oninput={onInput}
  class="grow"
  name={record.id}
  placeholder={record.placeholder}
  password={value}
  readonly={!!record.readonly}
  id="input-standard-{record.id}"
  aria-invalid={invalidEntry}
  aria-label={record.description} />
