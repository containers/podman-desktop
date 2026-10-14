<script lang="ts">
import { PreferredRegistriesSettings } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import type * as containerDesktopAPI from '@desktop-framework/extension-api';
import { faPlusCircle, faTrash, faUser, faUserPen } from '@fortawesome/free-solid-svg-icons';
import { Button, DropdownMenu, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onMount } from 'svelte';

import Dialog from '/@/lib/dialogs/Dialog.svelte';
import PasswordInput from '/@/lib/ui/PasswordInput.svelte';
import { configurationProperties } from '/@/stores/configurationProperties';
import { registriesInfos, registriesSuggestedInfos } from '/@/stores/registries';

import PreferencesRenderingItem from './PreferencesRenderingItem.svelte';
import SettingsPage from './SettingsPage.svelte';

// contains the original instances of registries when user clicks on `Edit password` menu item
// to be able to roll back changes when `Cancel` button is clicked
let originRegistries = $state<containerDesktopAPI.Registry[]>([]);

// login error responses
let errorResponses = $state<{ serverUrl: string; error: string }[]>([]);

// list of server urls for which we show the password
let showPasswordForServerUrls = $state<string[]>([]);

interface Props {
  // show or hide new registry form
  showNewRegistryForm?: boolean;
}

let { showNewRegistryForm = false }: Props = $props();

// at this moment it should be `podman`, but later can be any
let defaultProviderSourceName: string;

// List of registries to keep track of hidden / unhidden inputs
let listedSuggestedRegistries = $state<boolean[]>([]);

// Busy flag while attempting login
let loggingIn = $state(false);

// used when user tries to add new registry
const newRegistryRequest = $state<containerDesktopAPI.Registry>({
  source: '',
  serverUrl: '',
  username: '',
  secret: '',
});

// Preferred registries configuration property
let preferredRegistriesProperty: IConfigurationPropertyRecordedSchema | undefined = $derived(
  $configurationProperties.find(
    prop => prop.id === `${PreferredRegistriesSettings.SectionName}.${PreferredRegistriesSettings.Preferred}`,
  ),
);

onMount(async () => {
  let providerSourceNames = await window.getImageRegistryProviderNames();
  if (providerSourceNames && providerSourceNames.length > 0) {
    defaultProviderSourceName = providerSourceNames[0];
  }
});

function markRegistryAsModified(registry: containerDesktopAPI.Registry): void {
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

function markRegistryAsClean(registry: containerDesktopAPI.Registry): void {
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

function setPasswordForRegistryVisible(registry: containerDesktopAPI.Registry, visible: boolean): void {
  const serverUrl = registry === newRegistryRequest ? '' : registry.serverUrl;
  const index = showPasswordForServerUrls.findIndex(r => r === serverUrl);

  if (visible && index === -1) {
    showPasswordForServerUrls = [...showPasswordForServerUrls, serverUrl];
  } else if (!visible && index > -1) {
    showPasswordForServerUrls = showPasswordForServerUrls.filter(r => r !== serverUrl);
  }
}

function clearErrorResponse(serverUrl: string): void {
  setErrorResponse(serverUrl, undefined);
}

function setErrorResponse(serverUrl: string, message: string | undefined): void {
  if (message) {
    errorResponses = [...errorResponses, { serverUrl: serverUrl, error: message }];
  } else {
    errorResponses = errorResponses.filter(o => o.serverUrl !== serverUrl);
  }
}

function setNewSuggestedRegistryFormVisible(i: number, registry: containerDesktopAPI.RegistrySuggestedProvider): void {
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
function hideSuggestedRegistries(): void {
  // Hide everythihng
  listedSuggestedRegistries.forEach((_, index) => {
    listedSuggestedRegistries[index] = false;
  });

  // Clear all usernames and passwords
  clearSavedCredentials();
}

function setNewRegistryFormVisible(visible: boolean): void {
  // Hide any "suggested" registries which may be open
  hideSuggestedRegistries();

  // Cleared saved credentials before we show
  if (!visible) {
    clearSavedCredentials();
  }

  // Show the new registry form
  showNewRegistryForm = visible;
}

function clearSavedCredentials(): void {
  clearErrorResponse(newRegistryRequest.serverUrl);
  setPasswordForRegistryVisible(newRegistryRequest, false);
  newRegistryRequest.serverUrl = '';
  newRegistryRequest.username = '';
  newRegistryRequest.secret = '';
}

async function loginToRegistry(registry: containerDesktopAPI.Registry): Promise<void> {
  loggingIn = true;
  clearErrorResponse(registry.serverUrl);
  setPasswordForRegistryVisible(registry, false);

  registry.source = defaultProviderSourceName;

  const newRegistry = registry === newRegistryRequest;
  if (newRegistry) {
    registry.serverUrl = registry.serverUrl.trim().replace(/^https?:\/\//, '');
    registry.username = registry.username.trim();
    registry.secret = registry.secret.trim();
  }

  // Always check credentials before creating image / updating to see if they pass.
  // if we happen to get a certificate verification issue, as the user if they would like to
  // continue with the registry anyway.
  try {
    await window.checkImageCredentials($state.snapshot(registry));
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('unable to verify the first certificate') ||
        error.message.includes('self signed certificate in certificate chain'))
    ) {
      showNewRegistryForm = false;
      const result = await window.showMessageBox({
        title: 'Add Untrusted Registry?',
        type: 'warning',
        message: 'The certificate for this registry is not trusted / verifiable. Would you like to still add it?',
        buttons: ['Add', 'Cancel'],
      });
      if (result?.response === 'Add') {
        registry.insecure = true;
      } else {
        setErrorResponse(registry.serverUrl, error.message);
        loggingIn = false;
        showNewRegistryForm = true;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

async function removeExistingRegistry(registry: containerDesktopAPI.Registry): Promise<void> {
  await window.unregisterImageRegistry(registry);
  setPasswordForRegistryVisible(registry, false);
}
</script>

<SettingsPage title="Registries">
  {#snippet actions()}
    <div >
      <Button onclick={(): void => setNewRegistryFormVisible(true)} icon={faPlusCircle} disabled={showNewRegistryForm}>
        Add registry
      </Button>
    </div>
  {/snippet}

  <!-- Preferred Registries section start -->
  {#if preferredRegistriesProperty}
    <div class="bg-[var(--pd-invert-content-card-bg)] rounded-md mb-4">
      <PreferencesRenderingItem record={preferredRegistriesProperty} />
    </div>
  {/if}
  <!-- Preferred Registries section end -->

  <div class="container bg-[var(--pd-invert-content-card-bg)] rounded-md p-3">
    <!-- Registries table start -->
    <div class="w-full border-t border-b border-[var(--pd-content-text)]" role="table" aria-label="Registries">
      <div
        class="flex w-full space-x-2 text-sm font-semibold text-[var(--pd-table-header-text)]"
        role="rowgroup"
        aria-label="header">
        <div class="text-left py-4 uppercase w-2/5 min-w-0 pl-5" role="columnheader">Registry Location</div>
        <div class="text-left py-4 uppercase w-1/5 min-w-0" role="columnheader">Username</div>
        <div class="text-left py-4 uppercase w-1/5 min-w-0" role="columnheader">Password</div>
        <div class="text-left py-4 uppercase w-1/5 min-w-0" role="columnheader"></div>
      </div>

      {#each $registriesInfos as registry, index (index)}
        <!-- containerDesktopAPI.Registry row start -->
        <div
          class="flex flex-col w-full border-t border-[var(--pd-content-text)] text-[var(--pd-invert-content-card-text)]"
          role="row"
          aria-label={registry.name ?? registry.serverUrl}>
          <div class="flex flex-row items-center pt-4 pb-3 space-x-2">
            <div class="pl-5 w-2/5 min-w-0" role="cell">
              <div class="flex w-full h-full">
                <div class="flex items-center min-w-0">
                  <!-- Only show if a "suggested" registry icon has been added -->
                  {#if registry.icon}
                    <Icon icon={registry.icon} class="w-6 h-6 shrink-0" title={registry.name} />
                  {/if}
                  {#if registry.name}
                    <span class="ml-2 truncate">
                      {registry.name}
                    </span>
                  {:else}
                    <span class="ml-2 truncate">
                      {registry.serverUrl.replace('https://', '')}
                    </span>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Username -->
            <div class="w-1/5 min-w-0 truncate" role="cell">
              {#if originRegistries.some(r => r.serverUrl === registry.serverUrl)}
                <Input placeholder="Username" aria-label="Username" bind:value={registry.username} />
              {:else if !registry.username && !registry.secret}
                <Button onclick={(): void => markRegistryAsModified(registry)}>Login now</Button>
              {:else}
                {registry.alias ?? registry.username}
              {/if}
            </div>

            <!-- Password -->
            {#if originRegistries.some(r => r.serverUrl === registry.serverUrl)}
              <div class="w-1/5 min-w-0" role="cell">
                <PasswordInput
                  id="r.serverUrl"
                  bind:password={registry.secret}
                  on:action={(): void =>
                    setPasswordForRegistryVisible(
                      registry,
                      !showPasswordForServerUrls.some(r => r === registry.serverUrl),
                    )} />
              </div>
              <div class="w-1/5 min-w-0 flex flex-row items-center justify-end space-x-1" role="cell">
                <Button onclick={(): Promise<void>=> loginToRegistry(registry)} inProgress={loggingIn}>Login</Button>
                <Button onclick={(): void => markRegistryAsClean(registry)} type="link">Cancel</Button>
              </div>
            {:else}
              <div class="w-1/5 min-w-0" role="cell">
                <!-- Password field start -->
                <div class="w-full self-center items-center truncate">
                  {#if !registry.username && !registry.secret}
                    <span class="no-user-select">&nbsp;</span>
                  {:else if showPasswordForServerUrls.some(r => r === registry.serverUrl)}
                    <span class="truncate block">{registry.secret}</span>
                  {:else}
                    ····················
                  {/if}
                </div>
                <!-- Password field end -->
              </div>
              <div class="w-1/5 min-w-0 flex flex-row space-x-2 justify-end" role="cell">
                <!-- Show/hide password start -->
                {#if registry.username && registry.secret}
                  {#if showPasswordForServerUrls.some(r => r === registry.serverUrl)}
                    <button
                      type="button"
                      class="justify-center"
                      id="hide-password"
                      title="Hide password"
                      aria-label="Hide password"
                      aria-expanded="true"
                      aria-haspopup="true"
                      onclick={(): void => setPasswordForRegistryVisible(registry, false)}>
                      <i class="fa fa-eye-slash"></i>
                    </button>
                  {:else}
                    <button
                      type="button"
                      class="justify-center"
                      id="show-password"
                      title="Show password"
                      aria-label="Show password"
                      aria-expanded="true"
                      aria-haspopup="true"
                      onclick={(): void => setPasswordForRegistryVisible(registry, true)}>
                      <i class="fa fa-eye"></i>
                    </button>
                  {/if}
                {/if}

                <!-- Show/hide password end -->
                <!-- containerDesktopAPI.Registry menu start -->
                <DropdownMenu>
                  <DropdownMenu.Item
                    title="Login"
                    onClick={(): void => markRegistryAsModified(registry)}
                    hidden={!!registry.username && !!registry.secret}
                    icon={faUser} />
                  <DropdownMenu.Item
                    title="Edit password"
                    onClick={(): void => markRegistryAsModified(registry)}
                    hidden={!registry.username && !registry.secret}
                    icon={faUserPen} />
                  <DropdownMenu.Item title="Remove" onClick={async (): Promise<void> => await removeExistingRegistry(registry)} icon={faTrash} />
                </DropdownMenu>
              </div>
            {/if}
          </div>
        </div>
        <div class="flex flex-row-reverse w-full pb-3 -mt-2">
          <span role="alert" class="w-2/3 pl-4 font-bold" aria-label="Error Message Content">
            {#if originRegistries.some(r => r.serverUrl === registry.serverUrl)}
              {errorResponses.find(o => o.serverUrl === registry.serverUrl)?.error ?? ''}
            {/if}
          </span>
        </div>
        <!-- containerDesktopAPI.Registry row end -->
      {/each}

      {#each $registriesSuggestedInfos as registry, i (i)}
        <!-- Add new registry form start -->
        <div
          class="flex flex-col w-full border-t border-[var(--pd-content-text)] text-[var(--pd-invert-content-card-text)]"
          role="row"
          aria-label={registry.name ? registry.name : registry.url}>
          <div class="flex flex-row items-center pt-4 pb-3 space-x-2">
            <div class="pl-5 w-2/5 min-w-0" role="cell">
              <div class="flex w-full h-full">
                <div class="flex items-center min-w-0">
                  {#if registry.icon}
                    <Icon icon={registry.icon} class="w-6 h-6 shrink-0" title={registry.name} />
                  {/if}
                  <!-- By default, just show the name, but if we go to add it, show the full URL including https -->
                  <span class="ml-2 truncate">
                    {#if listedSuggestedRegistries[i]}
                      https://{registry.url}
                    {:else}
                      {registry.name}
                    {/if}
                  </span>
                </div>
              </div>
            </div>
            <div class="w-1/5 min-w-0" role="cell">
              {#if listedSuggestedRegistries[i]}
                <Input placeholder="Username" aria-label="Username" bind:value={newRegistryRequest.username} />
              {/if}
            </div>
            <div class="w-1/5 min-w-0" role="cell">
              {#if listedSuggestedRegistries[i]}
                <PasswordInput
                  id="r.serverUrl"
                  bind:password={newRegistryRequest.secret}
                  on:action={(): void =>
                    setPasswordForRegistryVisible(
                      newRegistryRequest,
                      !showPasswordForServerUrls.some(r => r === ''),
                    )} />
              {/if}
            </div>
            <div class="w-1/5 min-w-0 flex items-center justify-end space-x-1" role="cell">
              {#if listedSuggestedRegistries[i]}
                <Button
                  onclick={(): Promise<void> => loginToRegistry(newRegistryRequest)}
                  disabled={!newRegistryRequest.serverUrl || !newRegistryRequest.username || !newRegistryRequest.secret}
                  inProgress={loggingIn}>
                  Login
                </Button>
              {/if}

              {#if listedSuggestedRegistries[i]}
                <Button onclick={(): void => hideSuggestedRegistries()} type="link">Cancel</Button>
              {:else}
                <Button onclick={(): void => setNewSuggestedRegistryFormVisible(i, registry)}>Configure</Button>
              {/if}
            </div>
          </div>
          <div class="flex flex-row w-full pb-3 -mt-2 pl-10">
            {#if listedSuggestedRegistries[i]}
              <span role='alert' class="font-bold whitespace-pre-line" aria-label="Error Message Content">
                {errorResponses.find(o => o.serverUrl === newRegistryRequest.serverUrl)?.error ?? ''}
              </span>
            {/if}
          </div>
        </div>
        <!-- Add new registry form end -->
      {/each}
    </div>
    <!-- Registries table end -->
  </div>
</SettingsPage>

{#if showNewRegistryForm}
  <Dialog
    title="Add Registry"
    onclose={(): void => {
      setNewRegistryFormVisible(false);
    }}>
    {#snippet content()}
        <div  class="flex flex-col text-[var(--pd-modal-text)] space-y-5">
        <div>
          <div>URL (HTTPS only)</div>
          <Input placeholder="https://registry.io" bind:value={newRegistryRequest.serverUrl}></Input>
        </div>

        <div class="flex flex-row space-x-5 justify-stretch w-full">
          <div class="w-full">
            <div>Username</div>
            <Input placeholder="Username" bind:value={newRegistryRequest.username}></Input>
          </div>

          <div class="w-full">
            <div>Password</div>
            <PasswordInput
              id="newRegistryRequest"
              bind:password={newRegistryRequest.secret}
              on:action={(): void =>
                setPasswordForRegistryVisible(newRegistryRequest, !showPasswordForServerUrls.some(r => r === ''))}
            ></PasswordInput>
          </div>
        </div>
      </div>
      {/snippet}
    {#snippet validation()}
        <ErrorMessage error={errorResponses.find(o => o.serverUrl === newRegistryRequest.serverUrl)?.error ?? ''}
        ></ErrorMessage
        >
      {/snippet}
    {#snippet buttons()}
      
        <Button type="link" onclick={(): boolean => (showNewRegistryForm = false)}>Cancel</Button>
        <Button
          type="primary"
          disabled={!newRegistryRequest.serverUrl.trim() ||
            !newRegistryRequest.username.trim() ||
            !newRegistryRequest.secret.trim()}
          inProgress={loggingIn}
          onclick={(): Promise<void> => loginToRegistry(newRegistryRequest)}>Add</Button>
      
      {/snippet}
  </Dialog>
{/if}
