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
  const target = e.target as HTMLElement;
  // Listen to anything **but** the button that has "data-task-button" attribute with a value of "Help"
  if (target && target.getAttribute('data-task-button') !== 'Help') {
    showMenu = outsideWindow.contains(e.target);
  }
}

async function onClick(action?: ItemAction): Promise<void> {
  toggleMenu();
  if (action?.kind === ActionKind.LINK) {
    await window.openExternal(action.parameter).catch(console.error);
  } else if (action?.kind === ActionKind.COMMAND) {
    await window.executeCommand(action.parameter).catch(console.error);
  }
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
        onClick={() => onClick(item.action)}
      />
      {/each}
    </HelpMenu>
  {/if}
</div>
