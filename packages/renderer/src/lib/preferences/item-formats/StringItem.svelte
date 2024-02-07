<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import Input from '../../ui/Input.svelte';
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
  on:input="{onInput}"
  class="grow"
  name="{record.id}"
  placeholder="{record.placeholder}"
  bind:value="{value}"
  readonly="{!!record.readonly}"
  id="input-standard-{record.id}"
  aria-invalid="{invalidEntry}"
  aria-label="{record.description}" />
