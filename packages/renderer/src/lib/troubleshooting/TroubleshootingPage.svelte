<script>
import { Tab } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import Route from '/@/Route.svelte';

import FormPage from '../ui/FormPage.svelte';
import TroubleshootingDevToolsConsoleLogs from './TroubleshootingDevToolsConsoleLogs.svelte';
import TroubleshootingGatherLogs from './TroubleshootingGatherLogs.svelte';
import TroubleshootingPageProviders from './TroubleshootingPageProviders.svelte';
import TroubleshootingPageStores from './TroubleshootingPageStores.svelte';
</script>

<FormPage title="Troubleshooting" showBreadcrumb="{false}">
  <i slot="icon" class="fas fa-lightbulb fa-2x" aria-hidden="true"></i>

  <svelte:fragment slot="tabs">
    <Tab title="Repair & Connections" routerPath="{$router.path}" url="repair-connections" />
    <Tab title="Logs" routerPath="{$router.path}" url="logs" />
    <Tab title="Gather Logs" routerPath="{$router.path}" url="gatherlogs" />
    <Tab title="Stores" routerPath="{$router.path}" url="stores" />
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
