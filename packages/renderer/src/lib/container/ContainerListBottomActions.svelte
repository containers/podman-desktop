<script lang="ts">
/*
  This component displays 2 buttons, when selectedItemsNumber > 0:
  - Delete
  - Create pod with x selected items

  The `bulkDeleteInProgress` property indicates if the Delete action is running

  A `deleteSelectedContainers` event is sent when the Delete button is clicked
  A `createPodFromContainers` event is sent when the Create button is clicked
*/
import { createEventDispatcher } from 'svelte';
import Button from '../ui/Button.svelte';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import SolidPodIcon from '../images/SolidPodIcon.svelte';

export let bulkDeleteInProgress: boolean;
export let selectedItemsNumber: number;

const dispatch = createEventDispatcher();

function deleteSelectedContainers() {
  dispatch('deleteSelectedContainers');
}

function createPodFromContainers() {
  dispatch('createPodFromContainers');
}
</script>

<div class="flex flex-row justify-start items-center w-full">
  {#if selectedItemsNumber > 0}
    <Button
      on:click="{() => deleteSelectedContainers()}"
      aria-label="Delete selected containers and pods"
      title="Delete {selectedItemsNumber} selected items"
      bind:inProgress="{bulkDeleteInProgress}"
      icon="{faTrash}" />
    <div class="px-1"></div>
    <Button
      on:click="{() => createPodFromContainers()}"
      title="Create Pod with {selectedItemsNumber} selected items"
      icon="{SolidPodIcon}" />
    <span class="pl-2">On {selectedItemsNumber} selected items.</span>
  {/if}
</div>
