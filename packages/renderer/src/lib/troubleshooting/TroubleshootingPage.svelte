<script>
import FormPage from '../ui/FormPage.svelte';
import TroubleshootingDevToolsConsoleLogs from './TroubleshootingDevToolsConsoleLogs.svelte';
import TroubleshootingPageProviders from './TroubleshootingPageProviders.svelte';
import TroubleshootingPageStores from './TroubleshootingPageStores.svelte';
</script>

<FormPage title="Troubleshooting" showBreadcrumb="{false}" showClose="{true}">
  <i slot="icon" class="fas fa-lightbulb fa-2x" aria-hidden="true"></i>

  <div slot="content" class="flex flex-col space-y-4 p-4">
    <TroubleshootingPageProviders />

    <TroubleshootingDevToolsConsoleLogs />

    <TroubleshootingPageStores />
  </div>
</FormPage>
