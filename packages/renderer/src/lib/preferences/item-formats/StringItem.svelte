<script lang="ts">
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

<input
  on:input="{onInput}"
  class="grow py-1 px-2 w-full outline-0 border-b-2 border-gray-800 hover:border-violet-500 focus:border-violet-500 placeholder-gray-900 bg-zinc-700"
  name="{record.id}"
  type="text"
  placeholder="{record.placeholder}"
  bind:value="{value}"
  readonly="{!!record.readonly}"
  id="input-standard-{record.id}"
  aria-invalid="{invalidEntry}"
  aria-label="{record.description}" />
