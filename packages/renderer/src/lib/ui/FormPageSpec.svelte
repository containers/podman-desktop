<script lang="ts">
import { Tab } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import FormPage from './FormPage.svelte';
</script>

<FormPage title="Test component" showBreadcrumb="{false}">
  <i slot="icon" class="fas fa-lightbulb fa-2x" aria-label="icon"></i>

  <i slot="actions" class="fas fa-lightbulb fa-2x" aria-label="actions"></i>

  <svelte:fragment slot="tabs">
    <Tab title="Foo" routerPath="{$router.path}" url="foo" />
    <Tab title="Bar" routerPath="{$router.path}" url="bar" />
    <Tab title="Baz" routerPath="{$router.path}" url="baz" />
  </svelte:fragment>

  <div slot="content" class="flex flex-col">
    <i class="fas fa-lightbulb fa-2x" aria-label="content"></i>
  </div>
</FormPage>
