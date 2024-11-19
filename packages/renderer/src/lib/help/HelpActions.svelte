<script lang="ts">
import { DropdownMenu } from '@podman-desktop/ui-svelte';

import { ActionKind, type ItemAction, Items } from './HelpItems';
import HelpMenu from './HelpMenu.svelte';

let showMenu = false;
let outsideWindow: HTMLDivElement;
window.events?.receive('toggle-help-menu', toggleMenu);

function toggleMenu(): void {
  showMenu = !showMenu;
}

function handleEscape({ key }: KeyboardEvent): void {
  if (key === 'Escape') {
    showMenu = false;
  }
}

function onWindowClick(e: any): void {
  showMenu = outsideWindow.contains(e.target);
}

function createOnClick(action?: ItemAction): () => void | undefined {
  return () => {
    toggleMenu();
    if (action?.kind === ActionKind.LINK) {
      window.openExternal(action.parameter).catch(console.error);
    } else if (action?.kind === ActionKind.COMMAND) {
      window.executeCommand(action.parameter).catch(console.error);
    }
  };
}
</script>
  
<svelte:window on:keyup={handleEscape} on:click={onWindowClick}/>

<div bind:this={outsideWindow}>
  {#if showMenu}
    <HelpMenu>
      {#each Items as item }
      <DropdownMenu.Item
        title={item.title}
        tooltip={item.tooltip}
        icon={item.icon}
        enabled={item.enabled}
        onClick={createOnClick(item.action)}
      />
      {/each}
    </HelpMenu>
  {/if}
</div>
