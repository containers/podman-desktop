<script lang="ts">
import { faPlusCircle, faTrash, faUser, faUserPen } from '@fortawesome/free-solid-svg-icons';
import type * as containerDesktopAPI from '@podman-desktop/api';
import { Button, DropdownMenu, Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import PasswordInput from '/@/lib/ui/PasswordInput.svelte';

import { registriesInfos, registriesSuggestedInfos } from '../../stores/registries';
import SettingsPage from './SettingsPage.svelte';

// contains the original instances of registries when user clicks on `Edit password` menu item
// to be able to roll back changes when `Cancel` button is clicked
let originRegistries: containerDesktopAPI.Registry[] = [];

// login error responses
let errorResponses: { serverUrl: string; error: string }[] = [];

// list of server urls for which we show the password
let showPasswordForServerUrls: string[] = [];

// show or hide new registry form
export let showNewRegistryForm = false;

// at this moment it should be `podman`, but later can be any
let defaultProviderSourceName: string;

// List of suggested registries to show
let suggestedRegistries: containerDesktopAPI.RegistrySuggestedProvider[] = [];

// List of registries to keep track of hidden / unhidden inputs
let listedSuggestedRegistries: boolean[] = [];

// Busy flag while attempting login
let loggingIn = false;

// used when user tries to add new registry
const newRegistryRequest = {
  source: '',
  serverUrl: '',
  username: '',
  secret: '',
} as containerDesktopAPI.Registry;

onMount(async () => {
  let providerSourceNames = await window.getImageRegistryProviderNames();
  if (providerSourceNames && providerSourceNames.length > 0) {
    defaultProviderSourceName = providerSourceNames[0];
  }
});

$: {
  suggestedRegistries;
}

function markRegistryAsModified(registry: containerDesktopAPI.Registry) {
  setPasswordForRegistryVisible(registry, false);

  // create a backup instance of registry with initial data to have an ability to roll back user changes
  const originRegistry = {
    source: registry.source,
    serverUrl: registry.serverUrl,
    username: registry.username,
    secret: registry.secret,
    alias: registry.alias,
  } as containerDesktopAPI.Registry;

  originRegistries = [...originRegistries, originRegistry];
}

function markRegistryAsClean(registry: containerDesktopAPI.Registry) {
  let originRegistry = originRegistries.find(r => r.serverUrl === registry.serverUrl);

  registriesInfos.update(registries => {
    const registryInfo = registries.find(r => r.serverUrl === originRegistry?.serverUrl);

    // here we check if values in edited registry are the same with the origin one and if they are differed,
    // then we roll back changes made by user when Cancel button is clicked
    if (
      registryInfo &&
      originRegistry &&
      (originRegistry.username !== registryInfo.username || originRegistry.secret !== registryInfo.secret)
    ) {
      registryInfo.username = originRegistry.username;
      registryInfo.secret = originRegistry.secret;
    }

    return registries;
  });

  originRegistries = originRegistries.filter(r => r.serverUrl !== registry.serverUrl);

  clearErrorResponse(registry.serverUrl);
  setPasswordForRegistryVisible(registry, false);
}

function setPasswordForRegistryVisible(registry: containerDesktopAPI.Registry, visible: boolean) {
  const serverUrl = registry === newRegistryRequest ? '' : registry.serverUrl;
  const index = showPasswordForServerUrls.findIndex(r => r === serverUrl);

  if (visible && index === -1) {
    showPasswordForServerUrls = [...showPasswordForServerUrls, serverUrl];
  } else if (!visible && index > -1) {
    showPasswordForServerUrls = showPasswordForServerUrls.filter(r => r !== serverUrl);
  }
}

function clearErrorResponse(serverUrl: string) {
  setErrorResponse(serverUrl, undefined);
}

function setErrorResponse(serverUrl: string, message: string | undefined) {
  if (message) {
    errorResponses = [...errorResponses, { serverUrl: serverUrl, error: message }];
  } else {
    errorResponses = errorResponses.filter(o => o.serverUrl !== serverUrl);
  }
}

function setNewSuggestedRegistryFormVisible(i: number, registry: containerDesktopAPI.RegistrySuggestedProvider) {
  // Hide the new registry form if it's visible
  setNewRegistryFormVisible(false);

  // Hide all suggested registries (which also makes sure that we clear any saved credentials)
  hideSuggestedRegistries();

  // Set the value of the URL to the one we want to show
  newRegistryRequest.serverUrl = registry.url;

  // Unhide the one we want to show
  listedSuggestedRegistries[i] = true;
}

// Separate function to hide everything and make sure that we clear any saved credentials
function hideSuggestedRegistries() {
  // Hide everythihng
  listedSuggestedRegistries.forEach((_, index) => {
    listedSuggestedRegistries[index] = false;
  });

  // Clear all usernames and passwords
  clearSavedCredentials();
}

function setNewRegistryFormVisible(visible: boolean) {
  // Hide any "suggested" registries which may be open
  hideSuggestedRegistries();

  // Cleared saved credentials before we show
  if (!visible) {
    clearSavedCredentials();
  }

  // Show the new registry form
  showNewRegistryForm = visible;
}

function clearSavedCredentials() {
  clearErrorResponse(newRegistryRequest.serverUrl);
  setPasswordForRegistryVisible(newRegistryRequest, false);
  newRegistryRequest.serverUrl = '';
  newRegistryRequest.username = '';
  newRegistryRequest.secret = '';
}

async function loginToRegistry(registry: containerDesktopAPI.Registry) {
  loggingIn = true;
  clearErrorResponse(registry.serverUrl);
  setPasswordForRegistryVisible(registry, false);

  registry.source = defaultProviderSourceName;

  const newRegistry = registry === newRegistryRequest;

  // Always check credentials before creating image / updating to see if they pass.
  // if we happen to get a certificate verification issue, as the user if they would like to
  // continue with the registry anyway.
  try {
    await window.checkImageCredentials(registry);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('unable to verify the first certificate') ||
        error.message.includes('self signed certificate in certificate chain'))
    ) {
      const result = await window.showMessageBox({
        title: 'Invalid Certificate',
        type: 'warning',
        message: 'The certificate for this registry is not trusted / verifiable. Would you like to still add it?',
        buttons: ['Yes', 'Cancel'],
      });
      if (result && result.response === 0) {
        registry.insecure = true;
      } else {
        setErrorResponse(registry.serverUrl, error.message);
        loggingIn = false;
        return;
      }
    }
  }

  try {
    if (newRegistry) {
      await window.createImageRegistry(registry.source, { ...registry });
    } else {
      await window.updateImageRegistry({ ...registry });
    }
  } catch (error: any) {
    setErrorResponse(registry.serverUrl, error.message);
  }

  if (!errorResponses.some(o => o.serverUrl === registry.serverUrl)) {
    if (newRegistry) {
      setNewRegistryFormVisible(false);
    } else {
      originRegistries = originRegistries.filter(r => r.serverUrl !== registry.serverUrl);
    }
  }
  loggingIn = false;
}

function removeExistingRegistry(registry: containerDesktopAPI.Registry) {
  window.unregisterImageRegistry(registry);
  setPasswordForRegistryVisible(registry, false);
}
</script>

<SettingsPage title="Registries">
  <div slot="actions">
    <Button on:click={() => setNewRegistryFormVisible(true)} icon={faPlusCircle} disabled={showNewRegistryForm}>
      Add registry
    </Button>
  </div>

  <div class="container bg-[var(--pd-invert-content-card-bg)] rounded-md p-3">
    <!-- Registries table start -->
    <div class="w-full border-t border-b border-gray-900" role="table" aria-label="Registries">
      <div
        class="flex w-full space-x-2 text-sm font-semibold text-[var(--pd-table-header-text)]"
        role="rowgroup"
        aria-label="header">
        <div class="text-left py-4 uppercase w-2/5 pl-5" role="columnheader">Registry Location</div>
        <div class="text-left py-4 uppercase w-1/5" role="columnheader">Username</div>
        <div class="text-left py-4 uppercase w-1/5" role="columnheader">Password</div>
        <div class="text-left py-4 uppercase w-1/5" role="columnheader"></div>
      </div>

      {#each $registriesInfos as registry}
        <!-- containerDesktopAPI.Registry row start -->
        <div
          class="flex flex-col w-full border-t border-gray-900 text-[var(--pd-invert-content-card-text)]"
          role="row"
          aria-label={registry.name ? registry.name : registry.serverUrl}>
          <div class="flex flex-row items-center pt-4 pb-3 space-x-2">
            <div class="pl-5 w-2/5" role="cell">
              <div class="flex w-full h-full">
                <div class="flex items-center">
                  <!-- Only show if a "suggested" registry icon has been added -->
                  {#if registry.icon}
                    <img alt={registry.name} src={'data:image/png;base64,' + registry.icon} width="24" height="24" />
                  {/if}
                  {#if registry.name}
                    <span class="ml-2">
                      {registry.name}
                    </span>
                  {:else}
                    <span class="ml-2">
                      {registry.serverUrl.replace('https://', '')}
                    </span>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Username -->
            <div class="w-1/5 text-ellipsis overflow-hidden" role="cell">
              {#if originRegistries.some(r => r.serverUrl === registry.serverUrl)}
                <Input placeholder="Username" aria-label="Username" bind:value={registry.username} />
              {:else if !registry.username && !registry.secret}
                <Button on:click={() => markRegistryAsModified(registry)}>Login now</Button>
              {:else}
                {registry.alias ?? registry.username}
              {/if}
            </div>

            <!-- Password -->
            {#if originRegistries.some(r => r.serverUrl === registry.serverUrl)}
              <div class="w-1/5" role="cell">
                <PasswordInput
                  id="r.serverUrl"
                  bind:password={registry.secret}
                  on:action={() =>
                    setPasswordForRegistryVisible(
                      registry,
                      !showPasswordForServerUrls.some(r => r === registry.serverUrl),
                    )} />
              </div>
              <div class="w-1/5" role="cell">
                <Button on:click={() => loginToRegistry(registry)} inProgress={loggingIn}>Login</Button>
                <Button on:click={() => markRegistryAsClean(registry)} type="link">Cancel</Button>
              </div>
            {:else}
              <div class="w-1/5" role="cell">
                <!-- Password field start -->
                <div class="container mx-auto w-full self-center items-center truncate">
                  {#if !registry.username && !registry.secret}
                    <span class="no-user-select">&nbsp;</span>
                  {:else if showPasswordForServerUrls.some(r => r === registry.serverUrl)}
                    {registry.secret}
                  {:else}
                    ····················
                  {/if}
                </div>
                <!-- Password field end -->
              </div>
              <div class="w-1/5 flex flex-row space-x-2 justify-end" role="cell">
                <!-- Show/hide password start -->
                {#if registry.username && registry.secret}
                  {#if showPasswordForServerUrls.some(r => r === registry.serverUrl)}
                    <button
                      type="button"
                      class="justify-center"
                      id="hide-password"
                      title="Hide password"
                      aria-expanded="true"
                      aria-haspopup="true"
                      on:click={() => setPasswordForRegistryVisible(registry, false)}>
                      <i class="fa fa-eye-slash"></i>
                    </button>
                  {:else}
                    <button
                      type="button"
                      class="justify-center"
                      id="show-password"
                      title="Show password"
                      aria-expanded="true"
                      aria-haspopup="true"
                      on:click={() => setPasswordForRegistryVisible(registry, true)}>
                      <i class="fa fa-eye"></i>
                    </button>
                  {/if}
                {/if}

                <!-- Show/hide password end -->
                <!-- containerDesktopAPI.Registry menu start -->
                <DropdownMenu>
                  <DropdownMenu.Item
                    title="Login"
                    onClick={() => markRegistryAsModified(registry)}
                    hidden={!!registry.username && !!registry.secret}
                    icon={faUser} />
                  <DropdownMenu.Item
                    title="Edit password"
                    onClick={() => markRegistryAsModified(registry)}
                    hidden={!registry.username && !registry.secret}
                    icon={faUserPen} />
                  <DropdownMenu.Item title="Remove" onClick={() => removeExistingRegistry(registry)} icon={faTrash} />
                </DropdownMenu>
              </div>
            {/if}
          </div>
        </div>
        <div class="flex flex-row-reverse w-full pb-3 -mt-2">
          <span class="w-2/3 pl-4 font-bold">
            {#if originRegistries.some(r => r.serverUrl === registry.serverUrl)}
              {errorResponses.find(o => o.serverUrl === registry.serverUrl)?.error ?? ''}
            {/if}
          </span>
        </div>
        <!-- containerDesktopAPI.Registry row end -->
      {/each}

      {#each $registriesSuggestedInfos as registry, i (registry)}
        <!-- Add new registry form start -->
        <div
          class="flex flex-col w-full border-t border-gray-900 text-[var(--pd-invert-content-card-text)]"
          role="row"
          aria-label={registry.name ? registry.name : registry.url}>
          <div class="flex flex-row items-center pt-4 pb-3 space-x-2">
            <div class="pl-5 w-2/5" role="cell">
              <div class="flex w-full h-full">
                <div class="flex items-center">
                  {#if registry.icon}
                    <img alt={registry.name} src={'data:image/png;base64,' + registry.icon} width="24" height="24" />
                  {/if}
                  <!-- By default, just show the name, but if we go to add it, show the full URL including https -->
                  <span class="ml-2">
                    {#if listedSuggestedRegistries[i]}
                      https://{registry.url}
                    {:else}
                      {registry.name}
                    {/if}
                  </span>
                </div>
              </div>
            </div>
            <div class="w-1/5" role="cell">
              {#if listedSuggestedRegistries[i]}
                <Input placeholder="Username" aria-label="Username" bind:value={newRegistryRequest.username} />
              {/if}
            </div>
            <div class="w-1/5" role="cell">
              {#if listedSuggestedRegistries[i]}
                <PasswordInput
                  id="r.serverUrl"
                  bind:password={newRegistryRequest.secret}
                  on:action={() =>
                    setPasswordForRegistryVisible(
                      newRegistryRequest,
                      !showPasswordForServerUrls.some(r => r === ''),
                    )} />
              {/if}
            </div>
            <div class="w-1/5 flex space-x-2 justify-end" role="cell">
              {#if listedSuggestedRegistries[i]}
                <Button
                  on:click={() => loginToRegistry(newRegistryRequest)}
                  disabled={!newRegistryRequest.serverUrl || !newRegistryRequest.username || !newRegistryRequest.secret}
                  inProgress={loggingIn}>
                  Login
                </Button>
              {/if}

              {#if listedSuggestedRegistries[i]}
                <Button on:click={() => hideSuggestedRegistries()} type="link">Cancel</Button>
              {:else}
                <Button on:click={() => setNewSuggestedRegistryFormVisible(i, registry)}>Configure</Button>
              {/if}
            </div>
          </div>
          <div class="flex flex-row w-full pb-3 -mt-2 pl-10">
            {#if listedSuggestedRegistries[i]}
              <span class="font-bold whitespace-pre-line">
                {errorResponses.find(o => o.serverUrl === newRegistryRequest.serverUrl)?.error ?? ''}
              </span>
            {/if}
          </div>
        </div>
        <!-- Add new registry form end -->
      {/each}

      {#if showNewRegistryForm}
        <!-- Add new registry form start -->
        <div class="flex flex-col w-full border-t border-gray-900 text-[var(--pd-invert-content-card-text)]">
          <div class="flex flex-row items-center pt-4 pb-3 space-x-2">
            <div class="pl-5 w-2/5">
              <Input
                placeholder="URL (HTTPS only)"
                aria-label="Register URL"
                bind:value={newRegistryRequest.serverUrl} />
            </div>
            <div class="w-1/5">
              <Input placeholder="Username" aria-label="Username" bind:value={newRegistryRequest.username} />
            </div>
            <div class="w-1/5">
              <PasswordInput
                id="newRegistryRequest"
                bind:password={newRegistryRequest.secret}
                on:action={() =>
                  setPasswordForRegistryVisible(newRegistryRequest, !showPasswordForServerUrls.some(r => r === ''))} />
            </div>
            <div class="w-1/5 flex space-x-2 justify-end" role="cell">
              <Button
                on:click={() => loginToRegistry(newRegistryRequest)}
                disabled={!newRegistryRequest.serverUrl || !newRegistryRequest.username || !newRegistryRequest.secret}
                inProgress={loggingIn}>
                Login
              </Button>
              <Button on:click={() => setNewRegistryFormVisible(false)} type="link">Cancel</Button>
            </div>
          </div>
          <div class="flex flex-row w-full pb-3 -mt-2 pl-10">
            <span class="font-bold whitespace-pre-line">
              {errorResponses.find(o => o.serverUrl === newRegistryRequest.serverUrl)?.error ?? ''}
            </span>
          </div>
        </div>
        <!-- Add new registry form end -->
      {/if}
    </div>
    <!-- Registries table end -->
  </div>
</SettingsPage>
