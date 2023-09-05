<script lang="ts">
import { onMount } from 'svelte';
import { configurationProperties } from '/@/stores/configurationProperties';
import { providerInfos } from '/@/stores/providers';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import PreferencesConnectionCreationRendering from '../preferences/PreferencesConnectionCreationRendering.svelte';
import type { OnboardingEmbeddedComponentId } from '../../../../main/src/plugin/api/onboarding';

export let embeddedComponent: OnboardingEmbeddedComponentId;
export let extensionId: string;

let configurationItems: IConfigurationPropertyRecordedSchema[];
$: configurationItems;
let providers: ProviderInfo[];
let providerInfo: ProviderInfo | undefined;
$: providerInfo;

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

{#if embeddedComponent === 'create' && providerInfo && configurationItems}
  {#if providerInfo?.containerProviderConnectionCreation === true}
    <PreferencesConnectionCreationRendering
      providerInfo="{providerInfo}"
      properties="{configurationItems}"
      propertyScope="ContainerProviderConnectionFactory"
      callback="{window.createContainerProviderConnection}"
      isEmbedded="{true}" />
  {/if}

  <!-- Create connection panel-->
  {#if providerInfo?.kubernetesProviderConnectionCreation === true}
    <PreferencesConnectionCreationRendering
      providerInfo="{providerInfo}"
      properties="{configurationItems}"
      propertyScope="KubernetesProviderConnectionFactory"
      callback="{window.createKubernetesProviderConnection}"
      isEmbedded="{true}" />
  {/if}
{/if}
