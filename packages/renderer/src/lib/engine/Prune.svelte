<script lang="ts">
import type { EngineInfoUI } from './EngineInfoUI';
import type { MessageBoxReturnValue } from '../../../../main/src/plugin/message-box';

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
    buttons: ['Yes', 'No'],
  });

  if (result && result.response === 0) {
    prune(type);
  }
}

// Function to prune the selected type: containers, pods, images and volumes
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
}
</script>

<button
  on:click="{() => openPruneDialog()}"
  class="pf-c-button pf-m-primary"
  type="button"
  title="Remove unused images">
  <span class="pf-c-button__icon pf-m-start">
    <i class="fas fa-trash" aria-hidden="true"></i>
  </span>
  Prune {type}
</button>
