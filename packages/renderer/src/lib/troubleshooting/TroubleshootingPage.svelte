<script lang="ts">
import { Page, Tab } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import Route from '/@/Route.svelte';

import { lastPage } from '../../stores/breadcrumb';
import { getTabUrl, isTabSelected } from '../ui/Util';
import TroubleshootingDevToolsConsoleLogs from './TroubleshootingDevToolsConsoleLogs.svelte';
import TroubleshootingGatherLogs from './TroubleshootingGatherLogs.svelte';
import TroubleshootingPageProviders from './TroubleshootingPageProviders.svelte';
import TroubleshootingPageStores from './TroubleshootingPageStores.svelte';

export function goToPreviousPage(): void {
  router.goto($lastPage.path);
}
</script>

<Page title="Troubleshooting" on:close={goToPreviousPage}>
  <i slot="icon" class="fas fa-lightbulb fa-2x" aria-hidden="true"></i>

  <div slot="tabs" class="flex flex-row px-2 border-b border-[var(--pd-content-divider)]">
    <Tab
      title="Repair & Connections"
      selected={isTabSelected($router.path, 'repair-connections')}
      url={getTabUrl($router.path, 'repair-connections')} />
    <Tab title="Logs" selected={isTabSelected($router.path, 'logs')} url={getTabUrl($router.path, 'logs')} />
    <Tab
      title="Gather Logs"
      selected={isTabSelected($router.path, 'gatherlogs')}
      url={getTabUrl($router.path, 'gatherlogs')} />
    <Tab title="Stores" selected={isTabSelected($router.path, 'stores')} url={getTabUrl($router.path, 'stores')} />
  </div>
  <div class="flex w-full h-full overflow-auto" slot="content">
    <Route path="/repair-connections" breadcrumb="Repair & Connections" navigationHint="tab">
      <TroubleshootingPageProviders />
    </Route>

    <Route path="/logs" breadcrumb="Logs" navigationHint="tab">
      <TroubleshootingDevToolsConsoleLogs />
    </Route>

    <Route path="/gatherlogs" breadcrumb="GatherLogs" navigationHint="tab">
      <TroubleshootingGatherLogs />
    </Route>

    <Route path="/stores" breadcrumb="Stores" navigationHint="tab">
      <TroubleshootingPageStores />
    </Route>
  </div>
</Page>
