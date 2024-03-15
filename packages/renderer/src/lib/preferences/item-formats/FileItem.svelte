<script lang="ts">
import { Input } from '@podman-desktop/ui-svelte';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import Button from '../../ui/Button.svelte';

export let record: IConfigurationPropertyRecordedSchema;
export let value: string;
export let onChange = async (_id: string, _value: string) => {};

let invalidEntry = false;

async function selectFilePath() {
  invalidEntry = false;
  const filePaths = await window.openDialog({ title: `Select ${record.description}` });
  if (record.id && filePaths && filePaths.length === 1) {
    onChange(record.id, filePaths[0]).catch((_: unknown) => (invalidEntry = true));
  }
}

function handleCleanValue(event: CustomEvent<MouseEvent>) {
  if (record.id) onChange(record.id, '');
  event.preventDefault();
}
</script>

<div class="w-full flex">
  <Input
    class="grow mr-2"
    name="{record.id}"
    readonly
    placeholder="{record.placeholder}"
    value="{value || ''}"
    id="input-standard-{record.id}"
    aria-invalid="{invalidEntry}"
    aria-label="{record.description}"
    on:action="{event => handleCleanValue(event)}" />
  <Button
    on:click="{() => selectFilePath()}"
    id="rendering.FilePath.{record.id}"
    aria-invalid="{invalidEntry}"
    aria-label="button-{record.description}">Browse ...</Button>
</div>
