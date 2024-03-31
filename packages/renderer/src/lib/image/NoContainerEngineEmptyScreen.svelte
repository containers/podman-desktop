<script lang="ts">
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { router } from 'tinro';

import Button from '../ui/Button.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';

function gotoResourcesPage() {
  router.goto('/preferences/resources/');
}

function gotoExtensionsPage() {
  router.goto('/preferences/extensions/');
}
</script>

<EmptyScreen
  title="No Container Engine"
  message="Ensure that you have at least one container engine configured and operational. Please go to the resources and follow to the provided guidelines for setting up a container engine."
  icon="{faLayerGroup}">
  <div class="flex gap-2 justify-center">
    <Button type="link" on:click="{() => gotoResourcesPage()}">Resources</Button>
    <Button type="link" on:click="{() => gotoExtensionsPage()}">Extensions</Button>
  </div>
</EmptyScreen>
