<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import Dropdown from '../../ui/Dropdown.svelte';

export let record: IConfigurationPropertyRecordedSchema;
export let value: string | undefined;
export let onChange = async (_id: string, _value: string) => {};

let invalidEntry = false;

function onInput(event: Event) {
  invalidEntry = false;
  const target = event.target as HTMLInputElement;
  if (record.id && target.value !== value)
    onChange(record.id, target.value).catch((_: unknown) => (invalidEntry = true));
}
</script>

<Dropdown
  name="{record.id}"
  id="input-standard-{record.id}"
  on:input="{onInput}"
  bind:value="{value}"
  aria-invalid="{invalidEntry}"
  aria-label="{record.description}">
  {#if record.enum}
    {#each record.enum as recordEnum}
      <option value="{recordEnum}">{recordEnum}</option>
    {/each}
  {/if}
</Dropdown>
