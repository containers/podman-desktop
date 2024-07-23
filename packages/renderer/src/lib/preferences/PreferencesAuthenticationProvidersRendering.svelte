<script lang="ts">
import {
  faArrowRightToBracket,
  faCircle,
  faRightFromBracket,
  faRightToBracket,
} from '@fortawesome/free-solid-svg-icons';
import { Button, DropdownMenu, EmptyScreen, Tooltip } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

import EmbeddableCatalogExtensionList from '/@/lib/extensions/EmbeddableCatalogExtensionList.svelte';

import { authenticationProviders } from '../../stores/authenticationProviders';
import KeyIcon from '../images/KeyIcon.svelte';
import SettingsPage from './SettingsPage.svelte';
</script>

<SettingsPage title="Authentication">
  <div class="container h-full" role="list">
    <!-- Authentication Providers table start -->
    <EmptyScreen
      icon={KeyIcon}
      title="No authentication providers"
      message="Install an authentication provider extension to add an authentication provider here."
      hidden={$authenticationProviders.length > 0}>
      <div class="flex gap-2 justify-center">
        <EmbeddableCatalogExtensionList category="Authentication" showInstalled={false} />
      </div>
    </EmptyScreen>
    {#each $authenticationProviders as provider}
      {@const sessionRequests = provider.sessionRequests ?? []}
      <!-- Registered Authentication Provider row start -->
      <div class="flex flex-col w-full mb-5" role="listitem" aria-label={provider.displayName}>
        <div class="flex rounded-md border-0 justify-between bg-[var(--pd-invert-content-card-bg)]">
          <!-- Icon + status -->
          <div class="ml-4 flex items-center" aria-label="Provider Information">
            <!-- Icon -->
            <div class="flex">
              {#if provider?.images?.icon}
                {#if typeof provider.images.icon === 'string'}
                  <img
                    src={provider.images.icon}
                    alt={provider.displayName}
                    aria-label="Icon for {provider.displayName} provider"
                    class="max-w-[40px] h-full" />
                  <!-- TODO check theme used for image, now use dark by default -->
                {:else}
                  <img
                    src={provider.images.icon.dark}
                    alt="Dark color theme icon for {provider.displayName} provider"
                    class="max-w-[40px]" />
                {/if}
              {:else}
                <svelte:component
                  this={KeyIcon}
                  size="40"
                  alt={provider.displayName}
                  aria-label="Default icon for {provider.displayName} provider" />
              {/if}
            </div>

            <!-- Authentication Provider name and status item start -->
            <div class="px-5 py-2 m-auto">
              <div class="flex flex-col">
                <div
                  class="flex items-center font-semibold text-[var(--pd-invert-content-card-header-text)] w-full h-full"
                  aria-label="Provider Name">
                  {provider.displayName}
                </div>
                <div class="flex flex-row items-center w-full h-full">
                  <Fa
                    class="h-3 w-3 text-sm mr-2 text-[var(--pd-status-{provider.accounts.length > 0
                      ? 'connected'
                      : 'disconnected'})]"
                    icon={faCircle} />
                  <div
                    class="uppercase text-xs text-[var(--pd-status-{provider.accounts.length > 0
                      ? 'connected'
                      : 'disconnected'})]"
                    aria-label="Provider Status">
                    <span>
                      {provider.accounts.length > 0 ? 'Logged in' : 'Logged out'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {#if provider?.accounts?.length > 0}
              <!-- Authentication Provider Session label start -->
              <div class="pt-3 pb-3 text-sm">
                {#each provider.accounts as account}
                  <div class="flex flex-row">
                    <div class="flex items-center w-full">
                      <div class="flex flex-row text-xs bg-charcoal-800 p-2 rounded-lg mt-1">
                        <span
                          class="my-auto font-bold col-span-1 text-ellipsis overflow-hidden max-w-64"
                          aria-label="Logged In Username">
                          {account.label}
                        </span>
                        <Tooltip bottomRight tip="Sign out of {account.label}">
                          <button
                            aria-label="Sign out of {account.label}"
                            class="pl-2 hover:cursor-pointer hover:text-white text-white"
                            on:click={() => window.requestAuthenticationProviderSignOut(provider.id, account.id)}>
                            <Fa class="h-3 w-3 text-md mr-2" icon={faRightFromBracket} />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <div class="ml-4 flex items-center" aria-label="Provider Actions">
            {#if sessionRequests.length === 1}
              {@const request = sessionRequests[0]}
              <!-- Authentication Provider Auth Request Sign In button start -->
              <Tooltip bottomLeft tip="Sign in to use {request.extensionLabel}">
                <Button
                  aria-label="Sign in"
                  class="pl-2 mr-4 hover:cursor-pointer hover:text-white text-white"
                  on:click={() => window.requestAuthenticationProviderSignIn(request.id)}>
                  <div class="flex flex-row items-center">
                    <Fa class="h-3 w-3 text-md mr-2" icon={faRightToBracket} />Sign in
                  </div>
                </Button>
              </Tooltip>
              <!-- Authentication Provider Auth Request Sign In button end -->
            {:else if sessionRequests.length > 1}
              <!-- Authentication Provider Auth Requests DropDown start -->
              <DropdownMenu>
                {#each sessionRequests as request}
                  <DropdownMenu.Item
                    title="Sign in to use {request.extensionLabel}"
                    onClick={() => window.requestAuthenticationProviderSignIn(request.id)}
                    icon={faArrowRightToBracket} />
                {/each}
              </DropdownMenu>
              <!-- Authentication Provider Auth Requests DropDown end -->
            {/if}
          </div>
        </div>
      </div>
      <!-- Registered Authentication Provider row end -->
    {/each}
  </div>
  <!-- Authentication Providers table end -->
</SettingsPage>
