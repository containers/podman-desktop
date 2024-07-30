<script lang="ts">
import { faKey, faSignIn, faSignOut } from '@fortawesome/free-solid-svg-icons';

import DropDownMenuItem from '../../../../ui/dist/dropdownMenu/DropDownMenuItem.svelte';
import DropDownMenuItems from '../../../../ui/dist/dropdownMenu/DropDownMenuItems.svelte';
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

function onWindowClick(e: any): void {
  showMenu = outsideWindow.contains(e.target);
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
  <DropDownMenuItems clientY={clientY} clientX={clientX}>
    <DropDownMenuItem
      title="Manage authentication"
      icon={faKey}
      onClick={() => (window.location.href = '#/preferences/authentication-providers')} />

    {#each $authenticationProviders as provider}
      {@const sessionRequests = provider.sessionRequests ?? []}
      {#if provider?.accounts?.length > 0}
        {#each provider.accounts as account}
          <DropDownMenuItem
            title={'Sign out of ' + account.label}
            onClick={() => window.requestAuthenticationProviderSignOut(provider.id, account.id)}
            icon={faSignOut} />
        {/each}
      {/if}

      {#each sessionRequests as request}
        <DropDownMenuItem
          title="Sign in to use {request.extensionLabel}"
          onClick={() => window.requestAuthenticationProviderSignIn(request.id)}
          icon={faSignIn} />
      {/each}
    {/each}
  </DropDownMenuItems>
{/if}
