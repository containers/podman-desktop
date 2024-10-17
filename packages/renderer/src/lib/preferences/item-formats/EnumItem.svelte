<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';

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

<select
  class="border-b block w-full p-1 bg-[var(--pd-input-field-bg)] border-[var(--pd-input-field-hover-stroke)] text-[var(--pd-input-field-focused-text)] text-sm checked:bg-[var(--pd-input-field-focused-bg)]"
  name={record.id}
  id="input-standard-{record.id}"
  on:input={onInput}
  bind:value={value}
  aria-invalid={invalidEntry}
  aria-label={record.description}>
  {#if record.enum}
    {#each record.enum as recordEnum}
      <option class="bg-[var(--pd-input-field-focused-bg)]" value={recordEnum}>{recordEnum}</option>
    {/each}
  {/if}
</select>
