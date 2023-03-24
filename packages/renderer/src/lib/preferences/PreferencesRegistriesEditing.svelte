<script lang="ts">
import type * as containerDesktopAPI from '@podman-desktop/api';
import { onMount } from 'svelte';
import { registriesInfos, registriesSuggestedInfos } from '../../stores/registries';
import DropdownMenu from '../ui/DropdownMenu.svelte';
import DropdownMenuItem from '../ui/DropDownMenuItem.svelte';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faUserPen } from '@fortawesome/free-solid-svg-icons';
import SettingsPage from './SettingsPage.svelte';

// contains the original instances of registries when user clicks on `Edit password` menu item
// to be able to roll back changes when `Cancel` button is clicked
let originRegistries: containerDesktopAPI.Registry[] = [];

// login error responses
let errorResponses: { serverUrl: string; error: string }[] = [];

// list of server urls for which we show the password
let showPasswordForServerUrls: string[] = [];

// show or hide new registry form
let showNewRegistryForm = false;

// at this moment it should be `podman`, but later can be any
let defaultProviderSourceName: string;

// store password input fields to handle password showing trigger
let passwordElements: { serverUrl: string; element: HTMLInputElement }[] = [];

// List of suggested registries to show
let suggestedRegistries: containerDesktopAPI.RegistrySuggestedProvider[] = [];

// List of registries to keep track of hidden / unhidden inputs
let listedSuggestedRegistries = [];

// used when user tries to add new registry
const newRegistryRequest = {
  source: '',
  serverUrl: '',
  username: '',
  secret: '',
} as containerDesktopAPI.Registry;

onMount(async () => {
  let providerSourceNames = await window.getImageRegistryProviderNames();
  if (providerSourceNames.length > 0) {
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
  } as containerDesktopAPI.Registry;

  originRegistries = [...originRegistries, originRegistry];
}

function markRegistryAsClean(registry: containerDesktopAPI.Registry) {
  let originRegistry = originRegistries.find(r => r.serverUrl === registry.serverUrl);

  registriesInfos.update(registries => {
    const registryInfo = registries.find(r => r.serverUrl === originRegistry.serverUrl);

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

    let passwordInputElement = passwordElements.find(el => el.serverUrl === serverUrl);
    if (passwordInputElement) {
      passwordInputElement.element.type = 'text';
    }
  } else if (!visible && index > -1) {
    showPasswordForServerUrls = showPasswordForServerUrls.filter(r => r !== serverUrl);

    let passwordInputElement = passwordElements.find(el => el.serverUrl === serverUrl);
    if (passwordInputElement) {
      passwordInputElement.element.type = 'password';
    }
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
  clearErrorResponse(registry.serverUrl);
  setPasswordForRegistryVisible(registry, false);

  registry.source = defaultProviderSourceName;

  const newRegistry = registry === newRegistryRequest;

  try {
    if (newRegistry) {
      await window.createImageRegistry(registry.source, registry);
    } else {
      await window.updateImageRegistry(registry);
    }
  } catch (error) {
    setErrorResponse(registry.serverUrl, error.message);
  }

  if (!errorResponses.some(o => o.serverUrl === registry.serverUrl)) {
    if (newRegistry) {
      setNewRegistryFormVisible(false);
    } else {
      originRegistries = originRegistries.filter(r => r.serverUrl !== registry.serverUrl);
    }
  }
}

function removeExistingRegistry(registry: containerDesktopAPI.Registry) {
  window.unregisterImageRegistry(registry);
  setPasswordForRegistryVisible(registry, false);
}

const processPasswordElement = (node: HTMLInputElement, registry: containerDesktopAPI.Registry) => {
  const serverUrl = registry === newRegistryRequest ? '' : registry.serverUrl;
  passwordElements = [...passwordElements, { serverUrl: serverUrl, element: node }];

  return {
    destroy() {
      passwordElements = passwordElements.filter(el => el.serverUrl !== serverUrl);
    },
  };
};
</script>

<SettingsPage title="Registries">
  <div class="container mx-auto bg-zinc-800 mt-5 rounded-md p-3">
    <!-- Registries table start -->
    <div class="w-full border-t border-b border-gray-600">
      <div class="flex w-full">
        <div class="flex-1 text-left py-4 pl-5 text-sm font-bold w-auto">Registry Location</div>
        <div class="text-left py-4 text-sm font-bold w-1/4">Username</div>
        <div class="text-left py-4 text-sm font-bold w-2/5">Password</div>
      </div>

      {#each $registriesInfos as registry}
        <!-- containerDesktopAPI.Registry row start -->
        <div class="flex flex-col w-full border-t border-gray-600">
          <div class="flex flex-row">
            <div class="flex-1 pt-2 pl-5 pr-5 text-sm w-auto m-auto">
              <div class="flex items-center w-full h-full">
                <div class="flex items-center">
                  <!-- Only show if a "suggested" registry icon has been added -->
                  {#if registry.icon}
                    <img
                      alt="{registry.name}"
                      src="{'data:image/png;base64,' + registry.icon}"
                      width="24"
                      height="24" />
                  {/if}
                  {#if registry.name}
                    <span class="ml-2">
                      {registry.name}
                    </span>
                  {:else}
                    <span class="ml-0">
                      {registry.serverUrl.replace('https://', '')}
                    </span>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Username -->
            <div class="pt-4 pb-2 text-sm w-1/4 m-auto">
              {#if originRegistries.some(r => r.serverUrl === registry.serverUrl)}
                <div class="text-left h-7 pr-5 mt-1.5 mb-0.5 text-sm w-full">
                  <input
                    type="text"
                    placeholder="Username"
                    bind:value="{registry.username}"
                    class="block px-3 block w-full h-full transition ease-in-out delay-50 bg-zinc-900 text-gray-400 placeholder-gray-400 rounded-sm focus:outline-none" />
                </div>
              {:else if !registry.username && !registry.secret}
                <button class="font-bold" on:click="{() => markRegistryAsModified(registry)}">Login now</button>
              {:else}
                {registry.username}
              {/if}
            </div>

            <!-- Password -->
            <div class="pt-4 pb-2 text-sm w-2/5">
              <div class="flex flex-row">
                {#if originRegistries.some(r => r.serverUrl === registry.serverUrl)}
                  <div class="flex text-left h-7 pr-5 mt-1.5 mb-0.5 text-sm w-full">
                    <div class="relative flex-1">
                      <div class="absolute inset-y-0 right-0 flex items-center px-1">
                        <input
                          id="password-toggle-{registry.serverUrl}"
                          class="hidden"
                          type="checkbox"
                          value="false"
                          tabindex="-1"
                          on:change="{() =>
                            setPasswordForRegistryVisible(
                              registry,
                              !showPasswordForServerUrls.some(r => r === registry.serverUrl),
                            )}" />
                        <label
                          class="px-2 py-1 text text-gray-600 cursor-pointer"
                          for="password-toggle-{registry.serverUrl}">
                          {#if showPasswordForServerUrls.some(r => r === registry.serverUrl)}
                            <i class="fas fa-eye-slash"></i>
                          {:else}
                            <i class="fas fa-eye"></i>
                          {/if}
                        </label>
                      </div>

                      <input
                        use:processPasswordElement="{registry}"
                        type="password"
                        placeholder="Password"
                        bind:value="{registry.secret}"
                        class="px-3 block w-full h-full transition ease-in-out delay-50 bg-zinc-900 text-gray-400 placeholder-gray-400 rounded-sm focus:outline-none pr-10" />
                    </div>
                  </div>
                  <div class="h-7 mt-1.5 mb-0.5 text-sm">
                    <button
                      on:click="{() => loginToRegistry(registry)}"
                      class="pf-c-button pf-m-primary transition ease-in-out delay-50 hover:cursor-pointer w-full h-full rounded-md shadow hover:shadow-lg"
                      type="button">
                      Login
                    </button>
                  </div>
                  <div class="h-7 mt-1.5 mb-0.5 text-sm">
                    <button
                      on:click="{() => markRegistryAsClean(registry)}"
                      class="transition ease-in-out delay-50 hover:cursor-pointer w-16 h-full"
                      type="button">
                      Cancel
                    </button>
                  </div>
                {:else}
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
                  <!-- Show/hide password start -->
                  <div class="self-center w-8">
                    {#if registry.username && registry.secret}
                      {#if showPasswordForServerUrls.some(r => r === registry.serverUrl)}
                        <button
                          type="button"
                          class="inline-flex w-full justify-center text-sm shadow-sm"
                          id="hide-password"
                          title="Hide password"
                          aria-expanded="true"
                          aria-haspopup="true"
                          on:click="{() => setPasswordForRegistryVisible(registry, false)}">
                          <i class="fa fa-eye-slash"></i>
                        </button>
                      {:else}
                        <button
                          type="button"
                          class="inline-flex w-full justify-center text-sm shadow-sm"
                          id="show-password"
                          title="Show password"
                          aria-expanded="true"
                          aria-haspopup="true"
                          on:click="{() => setPasswordForRegistryVisible(registry, true)}">
                          <i class="fa fa-eye"></i>
                        </button>
                      {/if}
                    {/if}
                  </div>
                  <!-- Show/hide password end -->
                  <!-- containerDesktopAPI.Registry menu start -->
                  <DropdownMenu>
                    <DropdownMenuItem
                      title="Login"
                      onClick="{() => markRegistryAsModified(registry)}"
                      hidden="{!!registry.username && !!registry.secret}"
                      icon="{faUser}" />
                    <DropdownMenuItem
                      title="Edit password"
                      onClick="{() => markRegistryAsModified(registry)}"
                      hidden="{!registry.username && !registry.secret}"
                      icon="{faUserPen}" />
                    <DropdownMenuItem
                      title="Remove"
                      onClick="{() => removeExistingRegistry(registry)}"
                      icon="{faTrash}" />
                  </DropdownMenu>
                {/if}
              </div>
            </div>
          </div>
          <div class="flex flex-row-reverse w-full pb-3 -mt-2">
            <span class="w-2/3 pl-4 text-sm font-bold">
              {#if originRegistries.some(r => r.serverUrl === registry.serverUrl)}
                {errorResponses.find(o => o.serverUrl === registry.serverUrl)?.error || ''}
              {/if}
            </span>
          </div>
        </div>
        <!-- containerDesktopAPI.Registry row end -->
      {/each}

      {#each $registriesSuggestedInfos as registry, i (registry)}
        <!-- Add new registry form start -->
        <div class="flex flex-col w-full border-t border-gray-600">
          <div class="flex flex-row">
            <div class="flex-1 pt-2 pl-5 pr-5 text-sm w-auto m-auto">
              <div class="flex items-center w-full h-full">
                <div class="flex items-center">
                  {#if registry.icon}
                    <img
                      alt="{registry.name}"
                      src="{'data:image/png;base64,' + registry.icon}"
                      width="24"
                      height="24" />
                  {/if}
                  <!-- By defualt, just show the name, but if we go to add it, show the full URL including https -->
                  <span class="ml-2 text-gray-400">
                    {#if listedSuggestedRegistries[i]}
                      https://{registry.url}
                    {:else}
                      {registry.name}
                    {/if}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex pt-4 pb-2 pr-5 text-sm w-1/4">
              {#if listedSuggestedRegistries[i]}
                <input
                  type="text"
                  placeholder="Username"
                  bind:value="{newRegistryRequest.username}"
                  class="px-3 block w-full h-7 pr-5 mb-0.5 transition ease-in-out delay-50 bg-zinc-900 text-gray-400 placeholder-gray-400 rounded-sm focus:outline-none" />
              {/if}
            </div>
            <div class="pt-4 pb-2 text-sm w-2/5">
              <div class="flex flex-row">
                <div class="relative flex-1 mr-5">
                  {#if listedSuggestedRegistries[i]}
                    <div class="absolute inset-y-0 right-0 flex items-center">
                      <input
                        id="password-toggle-new-registry"
                        class="hidden"
                        type="checkbox"
                        value="false"
                        tabindex="-1"
                        on:change="{() =>
                          setPasswordForRegistryVisible(
                            newRegistryRequest,
                            !showPasswordForServerUrls.some(r => r === ''),
                          )}" />
                      <label class="px-2 py-1 text text-gray-600 cursor-pointer" for="password-toggle-new-registry">
                        {#if showPasswordForServerUrls.some(r => r === '')}
                          <i class="fas fa-eye-slash"></i>
                        {:else}
                          <i class="fas fa-eye"></i>
                        {/if}
                      </label>
                    </div>
                    <input
                      use:processPasswordElement="{newRegistryRequest}"
                      type="password"
                      placeholder="Password"
                      bind:value="{newRegistryRequest.secret}"
                      class="px-3 block w-full h-7 transition ease-in-out delay-50 bg-zinc-900 text-gray-400 placeholder-gray-400 rounded-sm focus:outline-none pr-10" />
                  {/if}
                </div>

                <div class="flex text-sm">
                  {#if listedSuggestedRegistries[i]}
                    <button
                      on:click="{() => loginToRegistry(newRegistryRequest)}"
                      disabled="{!newRegistryRequest.serverUrl ||
                        !newRegistryRequest.username ||
                        !newRegistryRequest.secret}"
                      class="inline pf-c-button pf-m-primary transition ease-in-out delay-50 hover:cursor-pointer h-full rounded-md shadow hover:shadow-lg justify-center"
                      type="button">
                      Login
                    </button>
                  {/if}
                </div>
                <div class="flex text-sm">
                  <div class="h-7 mt-1.5 mb-0.5 pr-5 text-sm">
                    {#if listedSuggestedRegistries[i]}
                      <button
                        on:click="{() => hideSuggestedRegistries()}"
                        class="transition ease-in-out delay-50 hover:cursor-pointer h-full justify-center w-16"
                        type="button">
                        Cancel
                      </button>
                    {:else}
                      <button
                        on:click="{() => setNewSuggestedRegistryFormVisible(i, registry)}"
                        class="inline pf-c-button pf-m-primary transition ease-in-out delay-50 hover:cursor-pointer h-full rounded-md shadow hover:shadow-lg justify-center pb-1"
                        type="button">
                        Configure
                      </button>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-row w-full pb-3 -mt-2 pl-10">
            {#if listedSuggestedRegistries[i]}
              <span class="text-sm font-bold whitespace-pre-line">
                {errorResponses.find(o => o.serverUrl === newRegistryRequest.serverUrl)?.error || ''}
              </span>
            {/if}
          </div>
        </div>
        <!-- Add new registry form end -->
      {/each}

      {#if showNewRegistryForm}
        <!-- Add new registry form start -->
        <div class="flex flex-col w-full border-t border-gray-600">
          <div class="flex flex-row">
            <div class="flex-1 pt-2 pl-10 pr-5 text-sm w-auto m-auto">
              <input
                type="text"
                placeholder="URL (HTTPS only)"
                bind:value="{newRegistryRequest.serverUrl}"
                class="px-3 block w-full h-7 pr-5 mb-0.5 transition ease-in-out delay-50 bg-zinc-900 text-gray-400 placeholder-gray-400 rounded-sm focus:outline-none" />
            </div>
            <div class="flex pt-4 pb-2 pr-5 text-sm w-1/4">
              <input
                type="text"
                placeholder="Username"
                bind:value="{newRegistryRequest.username}"
                class="px-3 block w-full h-7 pr-5 mb-0.5 transition ease-in-out delay-50 bg-zinc-900 text-gray-400 placeholder-gray-400 rounded-sm focus:outline-none" />
            </div>
            <div class="pt-4 pb-2 text-sm w-2/5">
              <div class="flex flex-row">
                <div class="relative flex-1 mr-5">
                  <div class="absolute inset-y-0 right-0 flex items-center">
                    <input
                      id="password-toggle-new-registry"
                      class="hidden"
                      type="checkbox"
                      value="false"
                      tabindex="-1"
                      on:change="{() =>
                        setPasswordForRegistryVisible(
                          newRegistryRequest,
                          !showPasswordForServerUrls.some(r => r === ''),
                        )}" />
                    <label class="px-2 py-1 text text-gray-600 cursor-pointer" for="password-toggle-new-registry">
                      {#if showPasswordForServerUrls.some(r => r === '')}
                        <i class="fas fa-eye-slash"></i>
                      {:else}
                        <i class="fas fa-eye"></i>
                      {/if}
                    </label>
                  </div>
                  <input
                    use:processPasswordElement="{newRegistryRequest}"
                    type="password"
                    placeholder="Password"
                    bind:value="{newRegistryRequest.secret}"
                    class="px-3 block w-full h-7 transition ease-in-out delay-50 bg-zinc-900 text-gray-400 placeholder-gray-400 rounded-sm focus:outline-none pr-10" />
                </div>

                <div class="flex text-sm">
                  <button
                    on:click="{() => loginToRegistry(newRegistryRequest)}"
                    disabled="{!newRegistryRequest.serverUrl ||
                      !newRegistryRequest.username ||
                      !newRegistryRequest.secret}"
                    class="inline pf-c-button pf-m-primary transition ease-in-out delay-50 hover:cursor-pointer h-full rounded-md shadow hover:shadow-lg justify-center"
                    type="button">
                    Login
                  </button>
                </div>
                <div class="flex text-sm">
                  <button
                    on:click="{() => setNewRegistryFormVisible(false)}"
                    class="transition ease-in-out delay-50 hover:cursor-pointer h-full justify-center w-16"
                    type="button">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-row w-full pb-3 -mt-2 pl-10">
            <span class="text-sm font-bold whitespace-pre-line">
              {errorResponses.find(o => o.serverUrl === newRegistryRequest.serverUrl)?.error || ''}
            </span>
          </div>
        </div>
        <!-- Add new registry form end -->
      {/if}
    </div>
    <!-- Registries table end -->
  </div>

  <!-- Spacer start -->
  <div class="container h-full"></div>
  <!-- Spacer end -->

  <!-- Add new registry button start -->
  <div class="flex justify-end py-4 px-4 w-full">
    <button
      on:click="{() => setNewRegistryFormVisible(true)}"
      class="pf-c-button pf-m-primary transition ease-in-out delay-50 hover:cursor-pointer h-7 w-36 text-sm rounded-md shadow hover:shadow-lg"
      type="button"
      disabled="{showNewRegistryForm}">
      Add registry
    </button>
  </div>
  <!-- Add new registry button end -->
</SettingsPage>
