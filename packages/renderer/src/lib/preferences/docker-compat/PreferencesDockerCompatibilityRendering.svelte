<script lang="ts">
import SettingsPage from '../SettingsPage.svelte';
import PreferencesDockerCompatibilitySocketMappingStatus from './PreferencesDockerCompatibilitySocketMappingStatus.svelte';
</script>

<SettingsPage title="Docker compatibility">
  <div slot="subtitle" class="text-sm font-thin mt-2">
    Podman Desktop provides compatibility with Docker, allowing you to use your existing Docker commands, images and
    workflows.
  </div>
  <div class="flex flex-col space-y-4">
    <div class="container" role="list">
      Docker Preferences
      <PreferencesDockerCompatibilitySocketMappingStatus />
    </div>
  </div>
</SettingsPage>
