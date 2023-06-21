<script lang="ts">
import Route from '../../Route.svelte';
import { extensionInfos } from '../../stores/extensions';
import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import SettingsPage from './SettingsPage.svelte';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import { router } from 'tinro';

export let extensionId: string = undefined;

let extensionInfo: ExtensionInfo;
$: extensionInfo = $extensionInfos.find(extension => extension.id === extensionId);

async function stopExtension() {
  await window.stopExtension(extensionInfo.id);
}
async function startExtension() {
  await window.startExtension(extensionInfo.id);
}
async function removeExtension() {
  window.location.href = '#/preferences/extensions';
  await window.removeExtension(extensionInfo.id);
}
</script>

<SettingsPage title="{extensionInfo.displayName} Extension">
  <span slot="subtitle">
    {extensionInfo.description}
  </span>
  <div class="bg-charcoal-600 mt-5 rounded-md p-3">
    {#if extensionInfo}
      <Route path="/*" breadcrumb="{extensionInfo.displayName}" let:meta>
        <!-- Manage lifecycle-->
        <div class="flex pb-2">
          <div class="pr-2">Status</div>
          <ConnectionStatus status="{extensionInfo.state}" />
        </div>

        <div class="py-2 flex flex-row items-center">
          <!-- start is enabled only when stopped or failed -->
          <div class="px-2 text-sm italic text-gray-700">
            <button
              disabled="{extensionInfo.state !== 'stopped' && extensionInfo.state !== 'failed'}"
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
          <div class="px-2 text-sm italic text-gray-700">
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

          <!-- delete is enabled only when stopped or failed -->
          {#if extensionInfo.removable}
            <div class="px-2 text-sm italic text-gray-700">
              <button
                disabled="{extensionInfo.state !== 'stopped' && extensionInfo.state !== 'failed'}"
                on:click="{() => removeExtension()}"
                class="pf-c-button pf-m-primary"
                type="button">
                <span class="pf-c-button__icon pf-m-start">
                  <i class="fas fa-trash" aria-hidden="true"></i>
                </span>
                Remove
              </button>
            </div>
          {:else}
            <div class="text-gray-900 items-center px-2 text-sm">Default extension, cannot be removed</div>
          {/if}

          <div class="px-2 text-sm italic text-gray-700">
            <button
              on:click="{() => router.goto(`/preferences/walkthrough/${extensionInfo.id}`)}"
              class="pf-c-button pf-m-primary"
              type="button">
              <span class="pf-c-button__icon pf-m-start">
                <i class="fas fa-play" aria-hidden="true"></i>
              </span>
              Onboarding
            </button>
          </div>
        </div>
        {#if extensionInfo.error}
          <div class="flex flex-col">
            <div class="py-2">Extension error: {extensionInfo.error.message}</div>
            {#if extensionInfo.error.stack}
              <div class="py-2">Stack trace</div>
              <div class="py-2">{extensionInfo.error.stack}</div>
            {/if}
          </div>
        {/if}
      </Route>
    {/if}
  </div></SettingsPage>
