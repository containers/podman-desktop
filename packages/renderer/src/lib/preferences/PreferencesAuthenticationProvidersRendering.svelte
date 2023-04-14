<script lang="ts">
import { authenticationProviders } from '../../stores/authenticationProviders';
import { faCircle, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import SettingsPage from './SettingsPage.svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import KeyIcon from '../images/KeyIcon.svelte';
</script>

<SettingsPage title="Authentication">
  <div class="containder h-full">
    <!-- Authentication Providers table start -->
    <div class="w-full h-full">
      {#if $authenticationProviders.length === 0}
        <div class="grid grid-cols-1 justify-items-center content-center h-full w-full">
          <div class="mb-6"><svelte:component this="{KeyIcon}" size="55" /></div>
          <div><h1 class="pf-c-title pf-m-lg text-center">No authentication providers</h1></div>
          <div class="text-gray-400 mx-16 mt-3 text-center w-q">
            Install an authentication provider extension to add an authentication provider here.
          </div>
        </div>
      {/if}
      {#each $authenticationProviders as provider}
        <!-- Registered Authentication Provider row start -->
        <div class="flex flex-col w-full">
          <div class="flex rounded-lg border-0" style="background-color: rgb(39 39 42 / var(--tw-bg-opacity))">
            <!-- Authentication Provider name and status item start -->
            <div class="pl-10 pt-2 pb-2 text-sm w-1/3 m-auto">
              <div class="flex flex-col">
                <div class="flex items-center text-xl w-full h-full">
                  {provider.displayName}
                </div>
                <div class="flex flex-row items-center w-full h-full">
                  <dif>
                    <Fa
                      class="h-3 w-3 text-md mr-2 text-{provider.accounts.length > 0 ? 'green' : 'gray'}-500"
                      icon="{faCircle}" />
                  </dif>
                  <div class="uppercase text-xs text-{provider.accounts.length > 0 ? 'green' : 'gray'}-500">
                    <span>
                      {provider.accounts.length > 0 ? 'Logged in' : 'Logged out'}
                    </span>
                  </div>
                  {#if provider.accounts.length > 0}
                    <button title="Sign out of {provider.accounts[0].label}"
                      class="pl-2 hover:cursor-pointer hover:text-white text-white"
                      on:click="{() =>
                        window.requestAuthenticationProviderSignOut(provider.id, provider.accounts[0].id)}">
                      <Fa class="h-3 w-3 text-md mr-2" icon="{faRightFromBracket}" />
                    </button>
                  {/if}
                </div>
              </div>
            </div>
            <!-- Authentication Provider name and status item end -->

            <!-- Authentication Provider Session label start -->
            <div class="pt-3 pb-3 text-sm w-2/3 m-auto">
              <div class="flex flex-row">
                <div class="flex items-center w-full">
                  <span>
                    {provider.accounts.length > 0 ? provider.accounts[0].label : ''}
                  </span>
                </div>
              </div>
            </div>
            <!-- Authentication Provider Session label start -->
          </div>
        </div>
        <!-- Registered Authentication Provider row end -->
      {/each}
    </div>
    <!-- Authentication Providers table end -->
  </div>
</SettingsPage>
