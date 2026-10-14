<script lang="ts">
import type { ProviderInfo } from '@desktop-framework/api';
import { STATUS_BAR_PIN_CONSTANTS } from '@desktop-framework/api/status-bar';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@podman-desktop/ui-svelte/icons';

import ProviderButton from '/@/lib/statusbar/ProviderButton.svelte';
import { providerInfos } from '/@/stores/providers';
import { statusBarPinned } from '/@/stores/statusbar-pinned';

import PinMenu from './PinMenu.svelte';

let showMenu: boolean = $state(false);
let outsideWindow: HTMLDivElement;
window.events?.receive(STATUS_BAR_PIN_CONSTANTS.TOGGLE_MENU, toggleMenu);

let pinned: Map<string, boolean> = $derived(new Map($statusBarPinned.map(pin => [pin.value, pin.pinned])));

let providers: Map<ProviderInfo, boolean> = $derived(
  new Map(
    $providerInfos
      .filter(provider => pinned.has(provider.id))
      .map(provider => [provider, pinned.get(provider.id) ?? false]),
  ),
);

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
  if (target && target.getAttribute('data-task-button') !== 'Pin') {
    showMenu = outsideWindow.contains(target);
  }
}

function unpin(providerId: string): void {
  window.unpinStatusBar(providerId).catch(console.error);
}

function pin(providerId: string): void {
  window.pinStatusBar(providerId).catch(console.error);
}
</script>

<svelte:window on:keyup={handleEscape} on:click={onWindowClick}/>

<div bind:this={outsideWindow}>
  {#if showMenu}
    <PinMenu>
      {#each providers.entries() as [provider, pinned] (provider.id)}
        <ProviderButton
          class="w-full text-[var(--pd-dropdown-item-text)] hover:rounded-md hover:!bg-[var(--pd-dropdown-item-hover-bg)] hover:text-[var(--pd-dropdown-item-hover-text)]"
          provider={provider}
          onclick={pinned ? unpin.bind(undefined, provider.id) : pin.bind(undefined, provider.id)}
        >
          {#snippet left()}
            <div class="w-4">
              {#if pinned}
                <Icon icon={faCheck} title="Pinned" />
              {/if}
            </div>
          {/snippet}
        </ProviderButton>
      {/each}
    </PinMenu>
  {/if}
</div>
