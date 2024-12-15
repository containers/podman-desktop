<script lang="ts">
import { faKey, faSignIn, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu } from '@podman-desktop/ui-svelte';

import { handleNavigation } from '/@/navigation';
import { NavigationPage } from '/@api/navigation-page';

import { authenticationProviders } from '../../stores/authenticationProviders';

export let onBeforeToggle = (): void => {};
let showMenu = false;

let clientY: number;
let clientX: number;
export let outsideWindow: HTMLDivElement;

function toggleMenu(): void {
  onBeforeToggle();
  showMenu = !showMenu;
}

function handleEscape({ key }: KeyboardEvent): void {
  if (key === 'Escape') {
    showMenu = false;
  }
}

function onWindowClick(e: MouseEvent): void {
  showMenu = outsideWindow.contains(e.target as Node);
}

export function onButtonClick(e: MouseEvent): void {
  // keep track of the cursor position
  clientY = e.clientY;
  clientX = e.clientX;
  toggleMenu();
}
</script>

<svelte:window on:keyup={handleEscape} on:click={onWindowClick} />

{#if showMenu}
  <DropdownMenu.Items clientY={clientY} clientX={clientX}>
    <DropdownMenu.Item
      title="Manage authentication"
      icon={faKey}
      onClick={() => handleNavigation({ page: NavigationPage.AUTHENTICATION })} />

    {#each $authenticationProviders as provider}
      {@const sessionRequests = provider.sessionRequests ?? []}
      {#if provider?.accounts?.length > 0}
        {#each provider.accounts as account}
          <DropdownMenu.Item
            title="Sign out of {provider.displayName} ({account.label})"
            onClick={() => window.requestAuthenticationProviderSignOut(provider.id, account.id)}
            icon={faSignOut} />
        {/each}
      {/if}

      {#each sessionRequests as request}
        <DropdownMenu.Item
          title="Sign in with {provider.displayName} to use {request.extensionLabel}"
          onClick={() => window.requestAuthenticationProviderSignIn(request.id)}
          icon={faSignIn} />
      {/each}
    {/each}
  </DropdownMenu.Items>
{/if}
