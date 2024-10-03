<script lang="ts">
import SettingsPage from '../SettingsPage.svelte';
import PreferencesDockerCompatibilitySocketMappingStatus from './PreferencesDockerCompatibilitySocketMappingStatus.svelte';
import PreferencesDockerCompatibilityDockerContext from './PreferencesDockerCompatibilityDockerContext.svelte';
</script>

<SettingsPage title="Docker compatibility">
  <svelte:fragment slot="subtitle">
    Podman Desktop provides compatibility with Docker, allowing you to use your existing Docker commands, images and
    workflows.
  </svelte:fragment>
  <div class="flex flex-col space-y-4">
    <div class="container" role="list">
      Docker Preferences
      <PreferencesDockerCompatibilitySocketMappingStatus />
    </div>
  </div>
  <div class="flex flex-col space-y-4">
    <div class="container" role="list">
      Docker CLI Context
      <PreferencesDockerCompatibilityDockerContext />
    </div>
  </div>
</SettingsPage>
