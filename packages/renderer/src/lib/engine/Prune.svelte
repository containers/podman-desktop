<script lang="ts">
import Modal from '../dialogs/Modal.svelte';
import type { EngineInfoUI } from './EngineInfoUI';

// Imported type for prune (containers, images, pods, volumes)
export let type: string;

// List of engines that the prune will work on
export let engines: EngineInfoUI[];

// Functionality for modal
let openChoiceModal = false;
function toggleChoiceModal(): void {
  openChoiceModal = !openChoiceModal;
}
function keydownChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    toggleChoiceModal();
  }
}

// Function to prune the selected type: containers
// TODO: Add prune for pods, images and volumes in a later PR
async function prune(type: string) {
  switch (type) {
    case 'containers':
      engines.forEach(async engine => {
        try {
          await window.pruneContainers(engine.id);
        } catch (error) {
          console.error(error);
        }
      });
      break;
    case 'pods':
      engines.forEach(async engine => {
        try {
          await window.prunePods(engine.id);
        } catch (error) {
          console.error(error);
        }
      });
      break;
    case 'volumes':
      engines.forEach(async engine => {
        try {
          await window.pruneVolumes(engine.id);
        } catch (error) {
          console.error(error);
        }
      });
      break;
    case 'images':
      engines.forEach(async engine => {
        try {
          await window.pruneImages(engine.id);
        } catch (error) {
          console.error(error);
        }
      });
      break;
    default:
      console.error('Prune type not found');
      break;
  }

  // Close the modal once the prune is completed
  toggleChoiceModal();
}
</script>

<button on:click="{() => toggleChoiceModal()}" class="pf-c-button pf-m-primary" type="button" title="Prune {type}">
  <span class="pf-c-button__icon pf-m-start">
    <i class="fas fa-trash" aria-hidden="true"></i>
  </span>
  Prune {type}
</button>

<!-- Create modal that confirms the user wants to prune the selected type -->
{#if openChoiceModal}
  <Modal
    on:close="{() => {
      openChoiceModal = false;
    }}">
    <div
      class="inline-block w-full overflow-hidden text-left transition-all transform bg-zinc-800 z-50 h-[200px] rounded-xl shadow-xl shadow-neutral-900"
      on:keydown="{keydownChoice}">
      <div class="flex items-center justify-between bg-black px-5 py-4 border-b-2 border-violet-700">
        <h1 class="text-xl font-bold">Prune unused {type}</h1>

        <button class="hover:text-gray-200 px-2 py-1" on:click="{() => toggleChoiceModal()}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div class="bg-zinc-800 p-5 h-full flex flex-col justify-items-center">
        {#if engines.length > 1}
          <span class="pb-3">This action will prune all unused {type} from all container engines.</span>
        {:else}
          <span class="pb-3">This action will prune all unused {type} from the {engines[0].name} engine.</span>
        {/if}
        <span class="pb-3">Are you sure you want to continue?</span>
        <div class="pt-5 grid grid-cols-2 gap-10 place-content-center w-full">
          <button class="pf-c-button pf-m-primary" type="button" on:click="{() => prune(type)}">Yes</button>
          <button class="pf-c-button pf-m-secondary" type="button" on:click="{() => toggleChoiceModal()}">No</button>
        </div>
      </div>
    </div>
  </Modal>
{/if}
