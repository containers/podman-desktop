<script lang="ts">
import { Tab } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import FormPage from './FormPage.svelte';
import { getTabUrl, isTabSelected } from './Util';
</script>

<FormPage title="Test component" showBreadcrumb="{false}">
  <i slot="icon" class="fas fa-lightbulb fa-2x" aria-label="icon"></i>

  <i slot="actions" class="fas fa-lightbulb fa-2x" aria-label="actions"></i>

  <svelte:fragment slot="tabs">
    <Tab title="Foo" selected="{isTabSelected($router.path, 'foo')}" url="{getTabUrl($router.path, 'foo')}" />
    <Tab title="Bar" selected="{isTabSelected($router.path, 'bar')}" url="{getTabUrl($router.path, 'bar')}" />
    <Tab title="Baz" selected="{isTabSelected($router.path, 'baz')}" url="{getTabUrl($router.path, 'baz')}" />
  </svelte:fragment>

  <div slot="content" class="flex flex-col">
    <i class="fas fa-lightbulb fa-2x" aria-label="content"></i>
  </div>
</FormPage>
