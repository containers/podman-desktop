<script>
import NavPage from '../ui/NavPage.svelte';
import TroubleshootingDevToolsConsoleLogs from './TroubleshootingDevToolsConsoleLogs.svelte';
import TroubleshootingPageProviders from './TroubleshootingPageProviders.svelte';
</script>

<NavPage title="Troubleshooting" searchEnabled="{false}">
  <div slot="content" class="flex flex-col">
    <TroubleshootingPageProviders />

    <TroubleshootingDevToolsConsoleLogs />
  </div>
</NavPage>
