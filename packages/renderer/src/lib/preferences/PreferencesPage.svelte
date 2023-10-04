<script lang="ts">
import { configurationProperties } from '../../stores/configurationProperties';
import { onMount } from 'svelte';
import Route from '../../Route.svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import PreferencesRendering from './PreferencesRendering.svelte';
import PreferencesContainerConnectionRendering from './PreferencesContainerConnectionRendering.svelte';
import PreferencesKubernetesConnectionRendering from './PreferencesKubernetesConnectionRendering.svelte';
import PreferencesProviderRendering from './PreferencesProviderRendering.svelte';
import PreferencesExtensionRendering from './PreferencesExtensionRendering.svelte';
import PreferencesRegistriesEditing from './PreferencesRegistriesEditing.svelte';
import PreferencesPageDockerExtensions from '../docker-extension/PreferencesPageDockerExtensions.svelte';
import PreferencesProxiesRendering from './PreferencesProxiesRendering.svelte';
import PreferencesExtensionList from './PreferencesExtensionList.svelte';
import PreferencesResourcesRendering from './PreferencesResourcesRendering.svelte';
import PreferencesAuthenticationProvidersRendering from './PreferencesAuthenticationProvidersRendering.svelte';
import PreferencesInstallExtensionFromId from './PreferencesInstallExtensionFromId.svelte';
import PreferencesCliToolsRendering from './PreferencesCliToolsRendering.svelte';
import Onboarding from '../onboarding/Onboarding.svelte';
import { isDefaultScope } from './Util';

let properties: IConfigurationPropertyRecordedSchema[];
let defaultPrefPageId: string;

onMount(async () => {
  configurationProperties.subscribe(value => {
    properties = value;

    const iterator = value
      .filter(property => isDefaultScope(property.scope))
      .values()
      .next().value;

    if (iterator) {
      defaultPrefPageId = iterator.parentId.split('.')[0];
    }
  });
});
</script>

<div class="flex flex-col h-full">
  <Route path="/*" breadcrumb="Preferences">
    {#if defaultPrefPageId !== undefined}
      <PreferencesRendering key="{defaultPrefPageId}" properties="{properties}" />
    {:else}
      empty
    {/if}
  </Route>
  <Route path="/default/:key/*" breadcrumb="Preferences" let:meta>
    <PreferencesRendering key="{meta.params.key}" properties="{properties}" />
  </Route>
  <Route path="/ddExtensions" breadcrumb="Docker Desktop Extensions">
    <PreferencesPageDockerExtensions />
  </Route>
  <Route path="/extension/:extensionId/*" breadcrumb="Extensions" let:meta>
    <PreferencesExtensionRendering extensionId="{meta.params.extensionId}" />
  </Route>
  <Route path="/provider/:providerInternalId/*" breadcrumb="Resources" let:meta navigationHint="details">
    <PreferencesProviderRendering providerInternalId="{meta.params.providerInternalId}" properties="{properties}" />
  </Route>
  <Route path="/provider-task/:providerInternalId/:taskId/*" breadcrumb="Resources" let:meta>
    <PreferencesProviderRendering
      providerInternalId="{meta.params.providerInternalId}"
      properties="{properties}"
      taskId="{+meta.params.taskId}" />
  </Route>
  <Route path="/resources" breadcrumb="Resources" navigationHint="root">
    <PreferencesResourcesRendering />
  </Route>
  <Route path="/registries" breadcrumb="Registries">
    <PreferencesRegistriesEditing />
  </Route>
  <Route path="/authentication-providers" breadcrumb="Authentication">
    <PreferencesAuthenticationProvidersRendering />
  </Route>
  <Route path="/cli-tools" breadcrumb="Authentication">
    <PreferencesCliToolsRendering />
  </Route>
  <Route path="/proxies" breadcrumb="Proxy">
    <PreferencesProxiesRendering />
  </Route>
  <Route path="/extensions" breadcrumb="Extensions">
    <PreferencesExtensionList />
  </Route>

  <Route path="/extensions/install-from-id/:extensionId" breadcrumb="Install Extension from id" let:meta>
    <PreferencesInstallExtensionFromId extensionId="{meta.params.extensionId}" />
  </Route>

  <Route path="/onboarding/:extensionId" breadcrumb="Extension Onboarding" let:meta navigationHint="details">
    <Onboarding extensionIds="{[meta.params.extensionId]}" />
  </Route>

  <Route
    path="/container-connection/:provider/:name/:connection/*"
    breadcrumb="Container Engine"
    let:meta
    navigationHint="details">
    <PreferencesContainerConnectionRendering
      providerInternalId="{meta.params.provider}"
      name="{meta.params.name}"
      connection="{meta.params.connection}"
      properties="{properties}" />
  </Route>
  <Route
    path="/kubernetes-connection/:provider/:apiUrlBase64/*"
    breadcrumb="Kubernetes Engine"
    let:meta
    navigationHint="details">
    <PreferencesKubernetesConnectionRendering
      providerInternalId="{meta.params.provider}"
      apiUrlBase64="{meta.params.apiUrlBase64}"
      properties="{properties}" />
  </Route>
</div>
