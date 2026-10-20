<script lang="ts">
import { isAutoUpdatable } from '@desktop-framework/api';
import { Button } from '@podman-desktop/ui-svelte';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

interface Props {
  extension: CombinedExtensionInfoUI;
}

let { extension }: Props = $props();

let inProgress = $state(false);

async function toggleAutoUpdate(): Promise<void> {
  inProgress = true;
  try {
    await window.setExtensionAutoUpdate(extension.id, !!extension.autoUpdateDisabled);
  } catch (err: unknown) {
    console.error(`Unable to change the automatic updates of extension ${extension.id}`, err);
  } finally {
    inProgress = false;
  }
}
</script>

<!-- Docker Desktop extensions are never updated -->
{#if extension.type === 'pd' && isAutoUpdatable(extension)}
  <div class="flex flex-col lg:mb-4 items-start" role="region" aria-label="Auto-update">
    <div class="uppercase text-sm text-(--pd-details-card-header)">auto-update</div>
    <div class="flex flex-row items-center gap-2 font-thin text-sm text-(--pd-details-card-text)">
      <span>{extension.autoUpdateDisabled ? 'Disabled' : 'Enabled'}</span>
      <Button type="link" padding="px-0" {inProgress} onclick={toggleAutoUpdate}
        >{extension.autoUpdateDisabled ? 'Enable' : 'Disable'}</Button>
    </div>
  </div>
{/if}
