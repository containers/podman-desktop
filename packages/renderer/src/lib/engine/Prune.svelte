<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';

import type { EngineInfoUI } from './EngineInfoUI';

// Imported type for prune (containers, images, pods, volumes)
export let type: 'containers' | 'images' | 'pods' | 'volumes';

// List of engines that the prune will work on
export let engines: EngineInfoUI[];

const LABEL_IMAGE_UNUSED = 'All unused images';
const LABEL_IMAGE_UNTAGGED = 'All untagged images';

async function openPruneDialog(): Promise<void> {
  let message = 'This action will prune';

  if (type === 'images') {
    message += ' images';
  } else {
    message += ` all unused ${type}`;
  }
  if (engines.length > 1) {
    message += ' from all container engines.';
  } else {
    message += ' from the ' + engines[0].name + ' engine.';
  }

  const buttons: string[] = [];
  const cancel = 'Cancel';
  buttons.push(cancel);
  if (type === 'images') {
    buttons.push(LABEL_IMAGE_UNUSED);
    buttons.push(LABEL_IMAGE_UNTAGGED);
  } else {
    buttons.push('Yes');
  }

  const result = await window.showMessageBox({
    title: 'Prune',
    message: message,
    buttons,
  });

  const selectedItemLabel = buttons[result.response ?? 0];
  if (selectedItemLabel !== cancel) {
    await prune(type, selectedItemLabel);
  }
}

// Function to prune the selected type: containers, pods, images and volumes
async function prune(type: string, selectedItemLabel: string): Promise<void> {
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
          await window.pruneImages(engine.id, selectedItemLabel === LABEL_IMAGE_UNUSED);
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
