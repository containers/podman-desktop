<script lang="ts">
import Route from '../../Route.svelte';
import { extensionInfos } from '../../stores/extensions';
import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import SettingsPage from './SettingsPage.svelte';
export let extensionId: string = undefined;

let extensionInfo: ExtensionInfo;
$: extensionInfo = $extensionInfos.find(extension => extension.id === extensionId);

async function stopExtension() {
  await window.stopExtension(extensionInfo.id);
  window.dispatchEvent(new CustomEvent('extension-stopped', { detail: extensionInfo }));
}
async function startExtension() {
  await window.startExtension(extensionInfo.id);
  window.dispatchEvent(new CustomEvent('extension-started', { detail: extensionInfo }));
}
</script>

<SettingsPage title="{extensionInfo.displayName} Extension">
  <span slot="subtitle">
    {extensionInfo.description}
  </span>
  <div class="bg-zinc-800 mt-5 rounded-md p-3">
    {#if extensionInfo}
      <Route path="/*" breadcrumb="{extensionInfo.displayName}" let:meta>
        <!-- Manage lifecycle-->
        <div class="pl-1 py-2">
          <div class="text-sm italic text-gray-400">Status</div>
          <div class="pl-3 capitalize">{extensionInfo.state}</div>
        </div>

        <div class="py-2 flex flex:row">
          <!-- start is enabled only in stopped mode-->
          <div class="px-2 text-sm italic text-gray-400">
            <button
              disabled="{extensionInfo.state !== 'inactive'}"
              on:click="{() => startExtension()}"
              class="pf-c-button pf-m-primary"
              type="button">
              <span class="pf-c-button__icon pf-m-start">
                <i class="fas fa-play" aria-hidden="true"></i>
              </span>
              Enable
            </button>
          </div>

          <!-- stop is enabled only in started mode-->
          <div class="px-2 text-sm italic text-gray-400">
            <button
              disabled="{extensionInfo.state !== 'active'}"
              on:click="{() => stopExtension()}"
              class="pf-c-button pf-m-primary"
              type="button">
              <span class="pf-c-button__icon pf-m-start">
                <i class="fas fa-stop" aria-hidden="true"></i>
              </span>
              Disable
            </button>
          </div>
        </div>
      </Route>
    {/if}
  </div></SettingsPage>
