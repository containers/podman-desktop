<script lang="ts">
import Route from '../../Route.svelte';
import { extensionInfos } from '../../stores/extensions';
import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import SettingsPage from './SettingsPage.svelte';
import ExtensionStatus from '../ui/ExtensionStatus.svelte';
import Button from '../ui/Button.svelte';
import { faPlay, faPuzzlePiece, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';
import { router } from 'tinro';
import EmptyScreen from '../ui/EmptyScreen.svelte';

export let extensionId: string = undefined;

let extensionInfo: ExtensionInfo;

$: extensionInfo = $extensionInfos.find(extension => extension.id === extensionId);
$: hideOnboardingButton = true;
$: hasOnboarding(extensionId).then(value => (hideOnboardingButton = value));

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

async function hasOnboarding(extensionId: string): Promise<boolean> {
  const onboarding = await window.getOnboarding(extensionId);
  return !onboarding;
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

          <div class="px-2 text-sm italic text-gray-700" class:hidden="{hideOnboardingButton}">
            <button
              on:click="{() => router.goto(`/preferences/onboarding/${extensionInfo.id}`)}"
              class="pf-c-button pf-m-primary"
              type="button">
              <span class="pf-c-button__icon pf-m-start">
                <i class="fas fa-play" aria-hidden="true"></i>
              </span>
              Onboarding
            </button>
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
