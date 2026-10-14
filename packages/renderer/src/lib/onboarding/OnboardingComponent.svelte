<script lang="ts">
import type { OnboardingEmbeddedComponentType, ProviderInfo } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onMount } from 'svelte';

import PreferencesConnectionCreationOrEditRendering from '/@/lib/preferences/PreferencesConnectionCreationOrEditRendering.svelte';
import { configurationProperties } from '/@/stores/configurationProperties';
import { providerInfos } from '/@/stores/providers';

interface Props {
  component: OnboardingEmbeddedComponentType;
  extensionId: string;
}

let { component, extensionId }: Props = $props();

let configurationItems = $state<IConfigurationPropertyRecordedSchema[]>();
let providers: ProviderInfo[];
let providerInfo = $state<ProviderInfo | undefined>();

let providerDisplayName = $derived(
  (providerInfo?.containerProviderConnectionCreation
    ? (providerInfo?.containerProviderConnectionCreationDisplayName ?? undefined)
    : providerInfo?.kubernetesProviderConnectionCreation
      ? providerInfo?.kubernetesProviderConnectionCreationDisplayName
      : undefined) ?? providerInfo?.name,
);

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
      providerInfo={providerInfo}
      properties={configurationItems}
      propertyScope="ContainerProviderConnectionFactory"
      callback={window.createContainerProviderConnection}
      disableEmptyScreen={true}
      hideCloseButton={true} />
  {:else if component === 'createKubernetesProviderConnection' && providerInfo?.kubernetesProviderConnectionCreation === true}
    <PreferencesConnectionCreationOrEditRendering
      providerInfo={providerInfo}
      properties={configurationItems}
      propertyScope="KubernetesProviderConnectionFactory"
      callback={window.createKubernetesProviderConnection}
      disableEmptyScreen={true}
      hideCloseButton={true} />
  {:else}
    <div aria-label="not supported warning" class="flex flex-row min-h-[500px] items-center justify-center">
      <Icon size="1.125x" class="flex text-[var(--pd-state-warning)] mr-3" icon={faTriangleExclamation} />
      <span>This extension does not provide a component of type "{component}"</span>
    </div>
  {/if}
{/if}
