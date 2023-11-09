<script lang="ts">
import { faCheck, faPencil, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import Fa from 'svelte-fa';
import Button from '../../ui/Button.svelte';
import FloatNumberItem from './FloatNumberItem.svelte';

export let record: IConfigurationPropertyRecordedSchema;
export let value: number;
export let description: string | undefined = undefined;
export let onSave = (_recordId: string, _value: number) => {};

let editingInProgress = false;
let editedValue: number;
$: editedValue = value;
let disableSaveButton: boolean;
$: disableSaveButton = !editingInProgress || editedValue === value;

function invalidRecord(_error: string) {
  if (_error) {
    disableSaveButton = true;
  }
}

function onChange(_: string, _value: number) {
  editedValue = _value;
}

function onSwitchToInProgress(e: MouseEvent) {
  e.preventDefault();
  editingInProgress = true;
}

function onSaveClick(e: MouseEvent) {
  e.preventDefault();
  editingInProgress = false;
  if (record.id) {
    onSave(record.id, editedValue);
  }
}

function onCancel(e: MouseEvent) {
  e.preventDefault();
  editedValue = value;
  editingInProgress = false;
}
</script>

<div class="flex flex-row ml-1 items-center">
  {#if !editingInProgress}
    {value}
  {:else}
    <FloatNumberItem
      record="{record}"
      value="{Number(editedValue)}"
      onChange="{onChange}"
      invalidRecord="{invalidRecord}" />
  {/if}
  {#if description}
    <span class="ml-1" aria-label="description">
      {description}
    </span>
  {/if}

  {#if !editingInProgress}
    <Button on:click="{onSwitchToInProgress}" title="Edit" class="ml-1" padding="p-2" type="link">
      <Fa size="12" icon="{faPencil}" />
    </Button>
  {:else}
    <Button on:click="{onCancel}" title="Cancel" class="ml-3" padding="p-2" type="link">
      <Fa size="14" class="text-red-500" icon="{faXmark}" />
    </Button>
    <Button on:click="{onSaveClick}" title="Save" padding="p-2" disabled="{disableSaveButton}" type="link">
      <Fa size="14" class="text-green-500" icon="{faCheck}" />
    </Button>
  {/if}
</div>
