<script lang="ts">
import { onMount } from 'svelte';
import { configurationProperties } from '/@/stores/configurationProperties';
import { providerInfos } from '/@/stores/providers';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import PreferencesConnectionCreationRendering from '../preferences/PreferencesConnectionCreationRendering.svelte';
import type { OnboardingEmbeddedComponentType } from '../../../../main/src/plugin/api/onboarding';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';

export let component: OnboardingEmbeddedComponentType;
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

{#if providerInfo && configurationItems}
  {#if component === 'createContainerProviderConnection' && providerInfo?.containerProviderConnectionCreation === true}
    <PreferencesConnectionCreationRendering
      providerInfo="{providerInfo}"
      properties="{configurationItems}"
      propertyScope="ContainerProviderConnectionFactory"
      callback="{window.createContainerProviderConnection}"
      disableEmptyScreen="{true}"
      hideProviderImage="{true}"
      hideCloseButton="{true}" />
  {:else if component === 'createKubernetesProviderConnection' && providerInfo?.kubernetesProviderConnectionCreation === true}
    <PreferencesConnectionCreationRendering
      providerInfo="{providerInfo}"
      properties="{configurationItems}"
      propertyScope="KubernetesProviderConnectionFactory"
      callback="{window.createKubernetesProviderConnection}"
      disableEmptyScreen="{true}"
      hideProviderImage="{true}"
      hideCloseButton="{true}" />
  {:else}
    <div aria-label="not supported warning" class="flex flex-row min-h-[500px] items-center justify-center">
      <Fa size="18" class="flex text-amber-400 mr-3" icon="{faTriangleExclamation}" />
      <span>This extension does not provide a component of type "{component}"</span>
    </div>
  {/if}
{/if}
