<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import { cliToolInfos } from '../../stores/cli-tools';
import EngineIcon from '../ui/EngineIcon.svelte';
import PreferencesCliTool from './PreferencesCliTool.svelte';
import SettingsPage from './SettingsPage.svelte';
</script>

<SettingsPage title="CLI Tools">
  <div class="h-full" role="table" aria-label="cli-tools">
    <EmptyScreen
      aria-label="no-resource-panel"
      icon={EngineIcon}
      title="No CLI tool has been registered"
      message="Start an extension that registers a CLI"
      hidden={$cliToolInfos.length > 0} />

    {#each $cliToolInfos as cliTool}
      <PreferencesCliTool cliTool={cliTool} />
    {/each}
  </div>
</SettingsPage>
