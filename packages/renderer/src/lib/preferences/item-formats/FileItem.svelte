<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import Fa from 'svelte-fa';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Button from '../../ui/Button.svelte';
export let record: IConfigurationPropertyRecordedSchema;
export let value: string;
export let onChange = async (_id: string, _value: string) => {};

let invalidEntry = false;

async function selectFilePath() {
  invalidEntry = false;
  const result = await window.openFileDialog(`Select ${record.description}`);
  if (record.id && !result.canceled && result.filePaths.length === 1) {
    onChange(record.id, result.filePaths[0]).catch((_: unknown) => (invalidEntry = true));
  }
}

function handleCleanValue(
  event: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  },
) {
  if (record.id) onChange(record.id, '');
  event.preventDefault();
}
</script>

<div class="w-full flex">
  <input
    class="grow {!value ? 'mr-3' : ''} py-1 px-2 outline-0 text-sm placeholder-gray-900 bg-zinc-700"
    name="{record.id}"
    readonly
    type="text"
    placeholder="{record.placeholder}"
    value="{value || ''}"
    id="input-standard-{record.id}"
    aria-invalid="{invalidEntry}"
    aria-label="{record.description}" />
  <button
    class="relative cursor-pointer right-5"
    class:hidden="{!value}"
    aria-label="clear"
    on:click="{event => handleCleanValue(event)}">
    <Fa icon="{faXmark}" />
  </button>
  <Button
    on:click="{() => selectFilePath()}"
    id="rendering.FilePath.{record.id}"
    aria-invalid="{invalidEntry}"
    aria-label="button-{record.description}">Browse ...</Button>
</div>
