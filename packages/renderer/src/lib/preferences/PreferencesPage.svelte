<script lang="ts">
import { onMount } from 'svelte';

import PreferencesContainerConnectionEdit from '/@/lib/preferences/PreferencesContainerConnectionEdit.svelte';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import Route from '../../Route.svelte';
import { configurationProperties } from '../../stores/configurationProperties';
import Onboarding from '../onboarding/Onboarding.svelte';
import PreferencesAuthenticationProvidersRendering from './PreferencesAuthenticationProvidersRendering.svelte';
import PreferencesCliToolsRendering from './PreferencesCliToolsRendering.svelte';
import PreferencesContainerConnectionRendering from './PreferencesContainerConnectionRendering.svelte';
import PreferencesKubernetesConnectionRendering from './PreferencesKubernetesConnectionRendering.svelte';
import PreferencesKubernetesContextsRendering from './PreferencesKubernetesContextsRendering.svelte';
import PreferencesProviderRendering from './PreferencesProviderRendering.svelte';
import PreferencesProxiesRendering from './PreferencesProxiesRendering.svelte';
import PreferencesRegistriesEditing from './PreferencesRegistriesEditing.svelte';
import PreferencesRendering from './PreferencesRendering.svelte';
import PreferencesResourcesRendering from './PreferencesResourcesRendering.svelte';
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

<div class="flex flex-col h-full bg-[var(--pd-invert-content-bg)]">
  <Route path="/*" breadcrumb="Preferences">
    {#if defaultPrefPageId !== undefined}
      <PreferencesRendering key={defaultPrefPageId} properties={properties} />
    {:else}
      empty
    {/if}
  </Route>
  <Route path="/default/:key/*" breadcrumb="Preferences" let:meta>
    <PreferencesRendering key={meta.params.key} properties={properties} />
  </Route>
  <Route path="/provider/:providerInternalId/*" breadcrumb="Resources" let:meta navigationHint="details">
    <PreferencesProviderRendering providerInternalId={meta.params.providerInternalId} properties={properties} />
  </Route>
  <Route path="/provider-task/:providerInternalId/:taskId/*" breadcrumb="Resources" let:meta>
    <PreferencesProviderRendering
      providerInternalId={meta.params.providerInternalId}
      properties={properties}
      taskId={+meta.params.taskId} />
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
  <Route path="/cli-tools" breadcrumb="CLI Tools">
    <PreferencesCliToolsRendering />
  </Route>
  <Route path="/kubernetes-contexts" breadcrumb="Kubernetes Contexts">
    <PreferencesKubernetesContextsRendering />
  </Route>
  <Route path="/proxies" breadcrumb="Proxy">
    <PreferencesProxiesRendering />
  </Route>

  <Route path="/onboarding/:extensionId" breadcrumb="Extension Onboarding" let:meta navigationHint="details">
    <Onboarding extensionIds={[meta.params.extensionId]} />
  </Route>

  <Route
    path="/container-connection/view/:provider/:name/:connection/*"
    breadcrumb="Container Engine"
    let:meta
    navigationHint="details">
    <PreferencesContainerConnectionRendering
      providerInternalId={meta.params.provider}
      name={meta.params.name}
      connection={meta.params.connection}
      properties={properties} />
  </Route>
  <Route
    path="/container-connection/edit/:provider/:name/*"
    breadcrumb="Container Engine"
    let:meta
    navigationHint="details">
    <PreferencesContainerConnectionEdit
      providerInternalId={meta.params.provider}
      name={meta.params.name}
      properties={properties} />
  </Route>
  <Route
    path="/kubernetes-connection/:provider/:apiUrlBase64/*"
    breadcrumb="Kubernetes Engine"
    let:meta
    navigationHint="details">
    <PreferencesKubernetesConnectionRendering
      providerInternalId={meta.params.provider}
      apiUrlBase64={meta.params.apiUrlBase64}
      properties={properties} />
  </Route>
</div>
