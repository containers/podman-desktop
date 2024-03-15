<script lang="ts">
import { faPlay, faPuzzlePiece, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';

import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import Route from '../../Route.svelte';
import { extensionInfos } from '../../stores/extensions';
import Button from '../ui/Button.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';
import ExtensionStatus from '../ui/ExtensionStatus.svelte';
import SettingsPage from './SettingsPage.svelte';

export let extensionId: string | undefined = undefined;

let extensionInfo: ExtensionInfo | undefined;

$: extensionInfo = $extensionInfos.find(extension => extension.id === extensionId);

async function stopExtension() {
  if (extensionInfo) {
    await window.stopExtension(extensionInfo.id);
  }
}
async function startExtension() {
  if (extensionInfo) {
    await window.startExtension(extensionInfo.id);
  }
}
async function removeExtension() {
  if (extensionInfo) {
    window.location.href = '#/preferences/extensions';
    await window.removeExtension(extensionInfo.id);
  }
}
</script>

{#if !extensionInfo}
  <EmptyScreen title="Extension not found" icon="{faPuzzlePiece}" message="No extension found with id {extensionId}" />
{:else}
  <SettingsPage title="{extensionInfo.displayName} Extension">
    <span slot="subtitle">
      {extensionInfo.description}
    </span>
    <div class="flex flex-col bg-charcoal-600 rounded-md p-3">
      {#if extensionInfo}
        <Route path="/*" breadcrumb="{extensionInfo.displayName}">
          <!-- Manage lifecycle-->
          <div class="flex pb-2">
            <div class="pr-2">Status</div>
            <ExtensionStatus status="{extensionInfo.state}" />
          </div>

          <div class="py-2 flex flex-row items-center">
            <!-- start is enabled only when stopped or failed -->
            <div class="px-2 text-sm italic text-gray-700">
              <Button
                disabled="{extensionInfo.state !== 'stopped' && extensionInfo.state !== 'failed'}"
                on:click="{() => startExtension()}"
                icon="{faPlay}">
                Enable
              </Button>
            </div>

            <!-- stop is enabled only when started -->
            <div class="px-2 text-sm italic text-gray-700">
              <Button disabled="{extensionInfo.state !== 'started'}" on:click="{() => stopExtension()}" icon="{faStop}">
                Disable
              </Button>
            </div>

            <!-- delete is enabled only when stopped or failed -->
            {#if extensionInfo.removable}
              <div class="px-2 text-sm italic text-gray-700">
                <Button
                  disabled="{extensionInfo.state !== 'stopped' && extensionInfo.state !== 'failed'}"
                  on:click="{() => removeExtension()}"
                  icon="{faTrash}">
                  Remove
                </Button>
              </div>
            {:else}
              <div class="text-gray-900 items-center px-2 text-sm">Default extension, cannot be removed</div>
            {/if}
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
{/if}
