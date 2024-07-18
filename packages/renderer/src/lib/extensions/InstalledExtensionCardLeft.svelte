<script lang="ts">
import ExtensionIcon from '/@/lib/preferences/ExtensionIcon.svelte';
import ExtensionStatus from '/@/lib/ui/ExtensionStatus.svelte';
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import ExtensionBadge from './ExtensionBadge.svelte';
import ExtensionDetailsLink from './ExtensionDetailsLink.svelte';
import InstalledExtensionActions from './InstalledExtensionActions.svelte';

export let extension: CombinedExtensionInfoUI;
</script>

<div role="region" aria-label="Extension {extension.name} left actions">
  <div class="relative min-w-[200px] max-w-[200px]">
    <div class="flex flex-row items-center grow">
      <div><ExtensionIcon extension={extension} /></div>
      <div class="flex flex-col ml-2">
        <ExtensionDetailsLink
          displayIcon={false}
          class="my-auto text-[color:var(--pd-card-header-text)] break-words"
          extension={extension} />
        <div class="flex flex-row">
          <ExtensionStatus status={extension.type === 'dd' ? 'started' : extension.state} />
        </div>
      </div>
    </div>
    <ExtensionBadge class="mt-4" extension={extension} />
    <InstalledExtensionActions class="mt-4" extension={extension} />
  </div>
</div>
