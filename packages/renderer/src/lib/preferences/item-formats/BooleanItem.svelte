<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import SlideToggle from '../../ui/SlideToggle.svelte';

export let record: IConfigurationPropertyRecordedSchema;
export let checked = false;
export let onChange = async (_id: string, _value: boolean) => {};
let invalidEntry = false;

function onChecked(state: boolean) {
  invalidEntry = false;
  if (record.id && state !== checked) {
    onChange(record.id, state).catch((_: unknown) => (invalidEntry = true));
  }
}
</script>

<SlideToggle
  id="input-standard-{record.id}"
  name={record.id}
  left
  bind:checked={checked}
  on:checked={event => onChecked(event.detail)}
  readonly={!!record.readonly}
  disabled={!!record.readonly}
  aria-invalid={invalidEntry}
  aria-label={record.description ?? record.markdownDescription}>
  <span class="text-xs">{checked ? 'Enabled' : 'Disabled'}</span>
</SlideToggle>
