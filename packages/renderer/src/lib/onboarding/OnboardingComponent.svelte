<script lang="ts">
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';

import { configurationProperties } from '/@/stores/configurationProperties';
import { providerInfos } from '/@/stores/providers';
import type { OnboardingEmbeddedComponentType } from '/@api/onboarding';
import type { ProviderInfo } from '/@api/provider-info';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import PreferencesConnectionCreationOrEditRendering from '../preferences/PreferencesConnectionCreationOrEditRendering.svelte';

export let component: OnboardingEmbeddedComponentType;
export let extensionId: string;

let configurationItems: IConfigurationPropertyRecordedSchema[];
$: configurationItems;
let providers: ProviderInfo[];
let providerInfo: ProviderInfo | undefined;
$: providerInfo;

let providerDisplayName: string | undefined;
$: providerDisplayName =
  (providerInfo?.containerProviderConnectionCreation
    ? providerInfo?.containerProviderConnectionCreationDisplayName ?? undefined
    : providerInfo?.kubernetesProviderConnectionCreation
      ? providerInfo?.kubernetesProviderConnectionCreationDisplayName
      : undefined) ?? providerInfo?.name;

onMount(() => {
  configurationProperties.subscribe(value => {
    configurationItems = value;
  });

  providerInfos.subscribe(value => {
    providers = value;
    providerInfo = providers.find(p => p.extensionId === extensionId);
  });
});
</script>

{#if providerInfo && configurationItems}
  <h1 class="font-semibold px-6 pb-2" aria-label="title">
    Create a {providerDisplayName}
  </h1>
  {#if component === 'createContainerProviderConnection' && providerInfo?.containerProviderConnectionCreation === true}
    <PreferencesConnectionCreationOrEditRendering
      providerInfo="{providerInfo}"
      properties="{configurationItems}"
      propertyScope="ContainerProviderConnectionFactory"
      callback="{window.createContainerProviderConnection}"
      disableEmptyScreen="{true}"
      hideCloseButton="{true}" />
  {:else if component === 'createKubernetesProviderConnection' && providerInfo?.kubernetesProviderConnectionCreation === true}
    <PreferencesConnectionCreationOrEditRendering
      providerInfo="{providerInfo}"
      properties="{configurationItems}"
      propertyScope="KubernetesProviderConnectionFactory"
      callback="{window.createKubernetesProviderConnection}"
      disableEmptyScreen="{true}"
      hideCloseButton="{true}" />
  {:else}
    <div aria-label="not supported warning" class="flex flex-row min-h-[500px] items-center justify-center">
      <Fa size="1.125x" class="flex text-amber-400 mr-3" icon="{faTriangleExclamation}" />
      <span>This extension does not provide a component of type "{component}"</span>
    </div>
  {/if}
{/if}
