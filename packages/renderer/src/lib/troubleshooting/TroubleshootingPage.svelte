<script>
import { Tab } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import Route from '/@/Route.svelte';

import FormPage from '../ui/FormPage.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
import TroubleshootingDevToolsConsoleLogs from './TroubleshootingDevToolsConsoleLogs.svelte';
import TroubleshootingGatherLogs from './TroubleshootingGatherLogs.svelte';
import TroubleshootingPageProviders from './TroubleshootingPageProviders.svelte';
import TroubleshootingPageStores from './TroubleshootingPageStores.svelte';
</script>

<FormPage title="Troubleshooting" showBreadcrumb={false}>
  <i slot="icon" class="fas fa-lightbulb fa-2x" aria-hidden="true"></i>

  <svelte:fragment slot="tabs">
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
  </svelte:fragment>
  <svelte:fragment slot="content">
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
  </svelte:fragment>
</FormPage>
