<script lang="ts">
  import { authenticationProviders } from '../../stores/authenticationProviders';
  import DropdownMenu from '../ui/DropdownMenu.svelte';
  import DropdownMenuItem from '../ui/DropDownMenuItem.svelte';
  import { faUser } from '@fortawesome/free-solid-svg-icons';
</script>
  
  <div class="flex w-full flex-col p-2 bg-zinc-800">
    <h1 class="capitalize text-lg font-bold py-8 px-8">Authentication</h1>
    <div class="container mx-auto">
      <!-- Registries table start -->
      <div class="w-full border-t border-b border-gray-600">
        <div class="flex w-full">
          <div class="flex-1 text-left py-4 pl-10 text-sm font-bold w-1/4">Provider Name</div>
          <div class="text-left py-4 text-sm font-bold w-3/4">Logged in as</div>
        </div>
  
        {#each $authenticationProviders as provider}
          <!-- containerDesktopAPI.Registry row start -->
          <div class="flex flex-col w-full border-t border-gray-600">
            <div class="flex flex-row">
  
              <!-- Authenication Contributor name -->
              <div class="flex-1 pt-2 pl-10 pr-5 text-sm w-1/4 m-auto">
                <div class="flex items-center w-full h-full">
                  <div class="flex items-center">
                    <!-- Only show if a "suggested" registry icon has been added -->
                      <span>
                        {provider.displayName}
                      </span>
                  </div>
                </div>
              </div>
  
              <!-- Username -->
              <div class="pt-2 pb-2 text-sm w-3/4 m-auto">
                <div class="flex flex-row">
                  <div class="flex items-center w-full">
                    <span>
                      {provider.accounts.length > 0 ? provider.accounts[0].label : 'Not logged in'}
                    </span>
                  </div>
                  {#if provider.accounts.length > 0}
                  <DropdownMenu>
                    <DropdownMenuItem
                      title="Sign Out"
                      onClick="{() => window.requestAuthenticationProviderSignOut(provider.id, provider.accounts[0].id)}"
                      icon="{faUser}" />
                  </DropdownMenu>
                  {/if}
                </div>
              </div>
            </div>
          </div>
          <!-- containerDesktopAPI.Registry row end -->
        {/each}
      </div>
      <!-- Registries table end -->
    </div>
  
    <!-- Spacer start -->
    <div class="container h-full"></div>
    <!-- Spacer end -->
    <!-- Add new registry button end -->
  </div>