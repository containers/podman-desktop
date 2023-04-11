<script lang="ts">
import Route from '../../Route.svelte';
import { extensionInfos } from '../../stores/extensions';
import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import SettingsPage from './SettingsPage.svelte';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
export let extensionId: string = undefined;

let extensionInfo: ExtensionInfo;
$: extensionInfo = $extensionInfos.find(extension => extension.id === extensionId);

async function stopExtension() {
  await window.stopExtension(extensionInfo.id);
}
async function startExtension() {
  await window.startExtension(extensionInfo.id);
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
        <div class="flex pb-2">
          <div class="pr-2">Status</div>
          <ConnectionStatus status="{extensionInfo.state}" />
        </div>

        <div class="py-2 flex flex:row gap-3">
          <!-- start is enabled only when stopped -->
          <div class="text-sm italic text-gray-400">
            <button
              disabled="{extensionInfo.state !== 'stopped'}"
              on:click="{() => startExtension()}"
              class="pf-c-button pf-m-primary"
              type="button">
              <span class="pf-c-button__icon pf-m-start">
                <i class="fas fa-play" aria-hidden="true"></i>
              </span>
              Start
            </button>
          </div>

          <!-- stop is enabled only when started -->
          <div class="text-sm italic text-gray-400">
            <button
              disabled="{extensionInfo.state !== 'started'}"
              on:click="{() => stopExtension()}"
              class="pf-c-button pf-m-primary"
              type="button">
              <span class="pf-c-button__icon pf-m-start">
                <i class="fas fa-stop" aria-hidden="true"></i>
              </span>
              Stop
            </button>
          </div>
        </div>
      </Route>
    {/if}
  </div>
</SettingsPage>
