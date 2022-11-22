<script lang="ts">
import { configurationProperties } from '../../stores/configurationProperties';
import { onMount } from 'svelte';
import { Route } from 'tinro';
import {
  ConfigurationRegistry,
  IConfigurationPropertyRecordedSchema,
} from '../../../../main/src/plugin/configuration-registry';

import PreferencesRendering from './PreferencesRendering.svelte';
import PreferencesContainerConnectionRendering from './PreferencesContainerConnectionRendering.svelte';
import PreferencesProviderRendering from './PreferencesProviderRendering.svelte';
import PreferencesExtensionRendering from './PreferencesExtensionRendering.svelte';
import PreferencesRegistriesEditing from './PreferencesRegistriesEditing.svelte';
import PreferencesPageDockerExtensions from '../docker-extension/PreferencesPageDockerExtensions.svelte';
import PreferencesProxiesRendering from './PreferencesProxiesRendering.svelte';
import NavPage from '../ui/NavPage.svelte';

let properties: IConfigurationPropertyRecordedSchema[];
let defaultPrefPageId: string;

onMount(async () => {
  configurationProperties.subscribe(value => {
    properties = value;
    [defaultPrefPageId] = value
      .filter(property => property.scope === ConfigurationRegistry.DEFAULT_SCOPE)
      .values()
      .next()
      .value.parentId.split('.');
  });
});
</script>

<NavPage searchEnabled="{false}" title="Settings" subtitle="&nbsp;">
  <div slot="empty" class="flex h-full px-3 py-3 bg-zinc-700">
    <Route path="/">
      {#if defaultPrefPageId !== undefined}
        <PreferencesRendering key="{defaultPrefPageId}" properties="{properties}" />
      {:else}
        empty
      {/if}
    </Route>
    <Route path="/default/:key" let:meta>
      <PreferencesRendering key="{meta.params.key}" properties="{properties}" />
    </Route>
    <Route path="/ddExtensions" let:meta>
      <PreferencesPageDockerExtensions />
    </Route>
    <Route path="/extensions" let:meta />
    <Route path="/extension/:extensionId" let:meta>
      <PreferencesExtensionRendering extensionId="{meta.params.extensionId}" />
    </Route>
    <Route path="/provider/:providerInternalId" let:meta>
      <PreferencesProviderRendering providerInternalId="{meta.params.providerInternalId}" properties="{properties}" />
    </Route>
    <Route path="/registries">
      <PreferencesRegistriesEditing />
    </Route>
    <Route path="/proxies">
      <PreferencesProxiesRendering />
    </Route>
    <Route path="/container-connection/" let:meta />
    <Route path="/container-connection/:provider/:connection" let:meta>
      <PreferencesContainerConnectionRendering
        providerInternalId="{meta.params.provider}"
        connection="{meta.params.connection}"
        properties="{properties}" />
    </Route>
  </div>
</NavPage>
