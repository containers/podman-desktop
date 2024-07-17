<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';

import type { EngineInfoUI } from './EngineInfoUI';

// Imported type for prune (containers, images, pods, volumes)
export let type: string;

// List of engines that the prune will work on
export let engines: EngineInfoUI[];

async function openPruneDialog(): Promise<void> {
  let message = 'This action will prune all unused ' + type;
  if (engines.length > 1) {
    message += ' from all container engines.';
  } else {
    message += ' from the ' + engines[0].name + ' engine.';
  }

  const result = await window.showMessageBox({
    title: 'Prune',
    message: message,
    buttons: ['Yes', 'Cancel'],
  });

  if (result && result.response === 0) {
    prune(type);
  }
}

// Function to prune the selected type: containers, pods, images and volumes
async function prune(type: string) {
  switch (type) {
    case 'containers':
      for (let engine of engines) {
        try {
          await window.pruneContainers(engine.id);
        } catch (error) {
          console.error(error);
        }
      }
      break;
    case 'pods':
      for (let engine of engines) {
        try {
          await window.prunePods(engine.id);
        } catch (error) {
          console.error(error);
        }
      }
      break;
    case 'volumes':
      for (let engine of engines) {
        try {
          await window.pruneVolumes(engine.id);
        } catch (error) {
          console.error(error);
        }
      }
      break;
    case 'images':
      for (let engine of engines) {
        try {
          await window.pruneImages(engine.id);
        } catch (error) {
          console.error(error);
        }
      }
      break;
    default:
      console.error('Prune type not found');
      break;
  }
}
</script>

<Button on:click={() => openPruneDialog()} title="Remove unused {type}" icon={faTrash}>Prune</Button>
