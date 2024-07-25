<script lang="ts">
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { Button, EmptyScreen } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

function gotoResourcesPage() {
  router.goto('/preferences/resources/');
}

function gotoExtensionsPage() {
  router.goto('/extensions/');
}
</script>

<EmptyScreen
  title="No Container Engine"
  message="Ensure that you have at least one container engine configured and operational. Please go to Resources and follow the provided guidelines for setting up a container engine."
  icon={faLayerGroup}>
  <div class="flex gap-2 justify-center">
    <Button type="link" on:click={() => gotoResourcesPage()}>Resources</Button>
    <Button type="link" on:click={() => gotoExtensionsPage()}>Extensions</Button>
  </div>
</EmptyScreen>
