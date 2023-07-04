<script lang="ts">
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import type { ComposeInfoUI } from './ComposeInfoUI';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import DropdownMenu from '../ui/DropdownMenu.svelte';
import FlatMenu from '../ui/FlatMenu.svelte';

export let compose: ComposeInfoUI;
export let dropdownMenu = false;
export let detailed = false;

export let inProgressCallback: (inProgress: boolean, state?: string) => void = () => {};
export let errorCallback: (erroMessage: string) => void = () => {};

async function restartCompose(composeInfoUI: ComposeInfoUI) {
  inProgressCallback(true, 'RESTARTING');
  try {
    await window.restartContainersByProject(composeInfoUI.engineId, composeInfoUI.name);
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false);
  }
}

// If dropdownMenu = true, we'll change style to the imported dropdownMenu style
// otherwise, leave blank.
let actionsStyle;
if (dropdownMenu) {
  actionsStyle = DropdownMenu;
} else {
  actionsStyle = FlatMenu;
}
</script>

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<svelte:component this="{actionsStyle}">
  <ListItemButtonIcon
    title="Restart Compose"
    onClick="{() => restartCompose(compose)}"
    menu="{dropdownMenu}"
    detailed="{detailed}"
    icon="{faArrowsRotate}" />
</svelte:component>
