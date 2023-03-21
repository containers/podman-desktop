<script lang="ts">
import { configurationProperties } from '../../stores/configurationProperties';
import { onMount } from 'svelte';
import { Route } from 'tinro';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { CONFIGURATION_DEFAULT_SCOPE } from '../../../../main/src/plugin/configuration-registry-constants';
import PreferencesRendering from './PreferencesRendering.svelte';
import PreferencesContainerConnectionRendering from './PreferencesContainerConnectionRendering.svelte';
import PreferencesKubernetesConnectionRendering from './PreferencesKubernetesConnectionRendering.svelte';
import PreferencesProviderRendering from './PreferencesProviderRendering.svelte';
import PreferencesExtensionRendering from './PreferencesExtensionRendering.svelte';
import PreferencesRegistriesEditing from './PreferencesRegistriesEditing.svelte';
import PreferencesPageDockerExtensions from '../docker-extension/PreferencesPageDockerExtensions.svelte';
import PreferencesProxiesRendering from './PreferencesProxiesRendering.svelte';
import ExtensionList from '../ExtensionList.svelte';
import PreferencesResourcesRendering from './PreferencesResourcesRendering.svelte';

let properties: IConfigurationPropertyRecordedSchema[];
let defaultPrefPageId: string;

onMount(async () => {
  configurationProperties.subscribe(value => {
    properties = value;

    const iterator = value
      .filter(property => property.scope === CONFIGURATION_DEFAULT_SCOPE)
      .values()
      .next().value;

    if (iterator) {
      [defaultPrefPageId] = iterator.parentId.split('.')[0];
    }
  });
});
</script>

<div class="flex h-full px-3 py-3 bg-zinc-900">
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
  <Route path="/resources">
    <PreferencesResourcesRendering />
  </Route>
  <Route path="/registries">
    <PreferencesRegistriesEditing />
  </Route>
  <Route path="/proxies">
    <PreferencesProxiesRendering />
  </Route>
  <Route path="/extensions">
    <ExtensionList />
  </Route>
  <Route path="/container-connection/" let:meta />
  <Route path="/container-connection/:provider/:connection" let:meta>
    <PreferencesContainerConnectionRendering
      providerInternalId="{meta.params.provider}"
      connection="{meta.params.connection}"
      properties="{properties}" />
  </Route>
  <Route path="/kubernetes-connection/:provider/:apiUrlBase64" let:meta>
    <PreferencesKubernetesConnectionRendering
      providerInternalId="{meta.params.provider}"
      apiUrlBase64="{meta.params.apiUrlBase64}"
      properties="{properties}" />
  </Route>
</div>
