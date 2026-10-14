<script lang="ts">
import { ActionKind, type ItemAction, type ItemInfo } from '@desktop-framework/api';
import { DropdownMenu } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import HelpMenu from './HelpMenu.svelte';

interface Props {
  items: readonly ItemInfo[];
}

const { items }: Props = $props();

let showMenu = $state(false);
let outsideWindow = $state<HTMLDivElement | undefined>();

onMount(() => {
  const disposable = window.events?.receive('toggle-help-menu', toggleMenu);
  return (): void => {
    disposable?.dispose();
  };
});

function toggleMenu(): void {
  showMenu = !showMenu;
}

function handleEscape({ key }: KeyboardEvent): void {
  if (key === 'Escape') {
    showMenu = false;
  }
}

function onWindowClick(e: Event): void {
  const target = e.target as HTMLElement;
  // Listen to anything **but** the button that has "data-task-button" attribute with a value of "Help"
  if (outsideWindow && target && target.getAttribute('data-task-button') !== 'Help') {
    showMenu = outsideWindow.contains(target);
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

<svelte:window onkeyup={handleEscape} onclick={onWindowClick}/>

<div bind:this={outsideWindow}>
  {#if showMenu}
    <HelpMenu>
      {#each items as item, index (index)}
      <DropdownMenu.Item
        title={item.title}
        tooltip={item.tooltip}
        icon={item.icon}
        enabled={item.enabled}
        onClick={(): Promise<void> => onClick(item.action)}
      />
      {/each}
    </HelpMenu>
  {/if}
</div>
