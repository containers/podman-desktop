<script lang="ts">
import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import { NavigationPage } from '@desktop-framework/api';
import type { PlayKubeInput } from '@desktop-framework/api/libpod';
import type { OpenDialogOptions } from '@desktop-framework/extension-api';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow, Checkbox, ErrorMessage } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';
import ContainerConnectionDropdown from '/@/lib/forms/ContainerConnectionDropdown.svelte';
import NoContainerEngineEmptyScreen from '/@/lib/image/NoContainerEngineEmptyScreen.svelte';
import KubePlayIcon from '/@/lib/kube/KubePlayIcon.svelte';
import EngineFormPage from '/@/lib/ui/EngineFormPage.svelte';
import FileInput from '/@/lib/ui/FileInput.svelte';
import WarningMessage from '/@/lib/ui/WarningMessage.svelte';
import { handleNavigation } from '/@/navigation';
import { providerInfos } from '/@/stores/providers';

let runStarted = $state(false);
let runFinished = $state(false);
let runError = $state('');
let kubeBuild: boolean = $state(false);
let kubeReplace: boolean = $state(false);
let runWarning = $state('');
let kubernetesYamlFilePath: string | undefined = $state(undefined);
let customYamlContent: string = $state('');
let userChoice: 'podman' | 'custom' = $state('podman');
let selectedProviderConnection: ProviderContainerConnectionInfo | undefined = $state(undefined);

let hasInvalidFields = $derived.by(() => {
  if (!selectedProviderConnection) return true;
  switch (userChoice) {
    case 'podman':
      return !kubernetesYamlFilePath;
    case 'custom':
      return customYamlContent.length === 0;
  }
});

let playKubeResultRaw: string | undefined = $state(undefined);
let playKubeResultJSON: unknown | undefined = $state(undefined);
let playKubeResult: { Pods?: unknown[] } | undefined = $state(undefined);
let cancellableTokenId: number | undefined = $state(undefined);

let providerConnections: ProviderContainerConnectionInfo[] = $derived(
  $providerInfos
    .map(provider => provider.containerConnections)
    .flat()
    // keep only podman providers as it is not supported by docker
    .filter(providerContainerConnection => providerContainerConnection.type === 'podman')
    .filter(providerContainerConnection => providerContainerConnection.status === 'started'),
);

$effect(() => {
  if (!selectedProviderConnection && providerConnections.length > 0) {
    selectedProviderConnection = providerConnections[0];
  }
});

const kubeFileDialogOptions: OpenDialogOptions = {
  title: 'Select a .yaml file to play',
  filters: [
    {
      name: 'YAML files',
      extensions: ['yaml', 'yml'],
    },
  ],
};

function removeEmptyOrNull(obj: object): object {
  Object.keys(obj).forEach(k => {
    const val = obj[k as keyof typeof obj];
    (val && typeof val === 'object' && removeEmptyOrNull(val)) ||
      (!val && val !== undefined && delete obj[k as keyof typeof obj]);
  });
  return obj;
}

async function cancel(): Promise<void> {
  if (cancellableTokenId === undefined) return;

  return window.cancelToken(cancellableTokenId);
}

async function playKubeFile(): Promise<void> {
  runStarted = true;
  runFinished = false;
  runError = '';

  const input: PlayKubeInput =
    userChoice === 'custom'
      ? { type: 'content', value: customYamlContent }
      : { type: 'path', value: kubernetesYamlFilePath! };

  if (input.value && selectedProviderConnection) {
    try {
      cancellableTokenId = await window.getCancellableTokenSource();

      const result = await window.playKube(input, $state.snapshot(selectedProviderConnection), {
        build: $state.snapshot(kubeBuild),
        replace: $state.snapshot(kubeReplace),
        cancellableTokenId: $state.snapshot(cancellableTokenId),
      });

      // remove the null values from the result
      playKubeResultRaw = JSON.stringify(removeEmptyOrNull(result), undefined, 2);
      playKubeResultJSON = JSON.parse(playKubeResultRaw);

      // If there are container errors, that means that it was *able* to create the container
      // but if failed to start. We will add this to the "warning" section as we were able to create the
      // We add this with comma deliminated errors
      if (playKubeResultJSON && typeof playKubeResultJSON === 'object') {
        playKubeResult = {};
        if (
          'Pods' in playKubeResultJSON &&
          playKubeResultJSON.Pods !== undefined &&
          Array.isArray(playKubeResultJSON.Pods) &&
          playKubeResultJSON.Pods.length > 0
        ) {
          playKubeResult.Pods = playKubeResultJSON.Pods;
          // Filter out the pods that have container errors, but check to see that container errors exists first
          const containerErrors = playKubeResultJSON.Pods.filter(
            (pod: unknown) =>
              pod &&
              typeof pod === 'object' &&
              'ContainerErrors' in pod &&
              Array.isArray(pod.ContainerErrors) &&
              pod.ContainerErrors.length > 0,
          );

          // For each Pod that has container errors, we will add the container errors to the warning message
          if (containerErrors.length > 0) {
            runWarning = `The following pods were created but failed to start: ${containerErrors
              .map((pod: unknown) =>
                pod && typeof pod === 'object' && 'ContainerErrors' in pod && Array.isArray(pod.ContainerErrors)
                  ? pod.ContainerErrors.join(', ')
                  : '',
              )
              .join(', ')}`;
          }
        }
      }

      runFinished = true;
    } catch (error) {
      runError = String(error);
      console.error('error playing kube file', error);
    }
  }
  runStarted = false;
}

function goBackToPodsPage(): void {
  // redirect to the pods page
  handleNavigation({
    page: NavigationPage.PODMAN_PODS,
  });
}

function toggle(choice: 'podman' | 'custom'): void {
  userChoice = choice;

  // reset custom content when switching away from custom
  if (choice === 'podman') {
    customYamlContent = '';
  }
}
</script>

{#if providerConnections.length === 0}
  <NoContainerEngineEmptyScreen />
{/if}

{#if providerConnections.length > 0}
  <EngineFormPage title="Create pods from a Kubernetes YAML file" inProgress={runStarted && !runFinished}>
    {#snippet icon()}
    <KubePlayIcon size="30px" />
    {/snippet}

    {#snippet content()}
    <div class="space-y-6">
      <div hidden={runStarted}>
        <label for="containerFilePath" class="block mb-2 text-base font-bold text-[var(--pd-content-card-header-text)]"
          >Kubernetes YAML file</label>

      </div>

      <div class="flex flex-col">
        <div
          hidden={providerConnections.length === 0}
          class="relative border-2 rounded-md p-5 bg-[var(--pd-content-card-inset-bg)]"
          class:border-[var(--pd-content-card-border-selected)]={userChoice === 'podman'}
          class:border-[var(--pd-content-card-border)]={userChoice !== 'podman'}>
          <!-- The selector covers the card, while the file controls stay interactive when this option is selected. -->
          <button
            type="button"
            class="absolute inset-0 w-full rounded-md cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring)]"
            aria-label="Podman Container Engine Runtime"
            aria-pressed={userChoice === 'podman' ? 'true' : 'false'}
            onclick={toggle.bind(undefined, 'podman')}></button>
          <div class="relative z-10 flex flex-row align-middle items-center pointer-events-none">
            <div
              class="text-2xl pr-2"
              class:text-[var(--pd-content-card-border-selected)]={userChoice === 'podman'}
              class:text-[var(--pd-content-card-border)]={userChoice !== 'podman'}>
              <Icon icon={faCircleCheck} />
            </div>
            <div class="flex-1" class:pointer-events-auto={userChoice === 'podman'}>
              <FileInput
                name="containerFilePath"
                id="containerFilePath"
                disabled={userChoice === 'custom'}
                bind:value={kubernetesYamlFilePath}
                placeholder="Select a .yaml file to play"
                options={kubeFileDialogOptions}
                class="w-full p-2" />
            </div>
          </div>
          <div hidden={runStarted} class="relative z-10" class:pointer-events-none={userChoice === 'custom'}>
            {#if providerConnections.length > 1}
              <label
                for="providerConnectionName"
                class="block mb-2 font-medium"
                class:text-[var(--pd-content-card-header-text)]={userChoice === 'podman'}
                class:text-[var(--pd-input-field-disabled-text)]={userChoice !== 'podman'}
                >Container Engine</label>
              <ContainerConnectionDropdown
                id="providerChoice"
                name="providerChoice"
                bind:value={selectedProviderConnection}
                disabled={userChoice === 'custom'}
                connections={providerConnections}/>
            {/if}
            {#if providerConnections.length === 1 && selectedProviderConnection}
              <input type="hidden" name="providerChoice" readonly bind:value={selectedProviderConnection.name} />
            {/if}
          </div>
        </div>

        <button
          class="border-2 rounded-md p-5 cursor-pointer bg-[var(--pd-content-card-inset-bg)]"
          aria-label="Create a file from scratch"
          aria-pressed={userChoice === 'custom' ? 'true' : 'false'}
          class:border-[var(--pd-content-card-border-selected)]={userChoice === 'custom'}
          class:border-[var(--pd-content-card-border)]={userChoice !== 'custom'}
          onclick={toggle.bind(undefined, 'custom')}>
          <div class="flex flex-row align-middle items-center">
            <div
              class="text-2xl"
              class:text-[var(--pd-content-card-border-selected)]={userChoice === 'custom'}
              class:text-[var(--pd-content-card-border)]={userChoice !== 'custom'}>
              <Icon icon={faCircleCheck} />
            </div>
            <div
              class="pl-2"
              class:text-[var(--pd-content-card-text)]={userChoice === 'custom'}
              class:text-[var(--pd-input-field-disabled-text)]={userChoice !== 'custom'}>
              Create a file from scratch
            </div>
          </div>
        </button>
      </div>

      <!-- Monaco Editor for custom YAML content -->
      {#if userChoice === 'custom'}
        <div class="space-y-3">
          <label for="custom-yaml-editor" class="block text-base font-bold text-[var(--pd-content-card-header-text)]">
            Custom Kubernetes YAML content
          </label>
          <div id="custom-yaml-editor" class="h-[400px] border">
            <MonacoEditor
              readOnly={false}
              language="yaml"
              on:contentChange={(e): void => {
                customYamlContent = e.detail;
              }} />
          </div>
        </div>
      {/if}

      <div class="flex flex-col gap-y-2">
        <div class="text-base font-bold text-[var(--pd-content-card-header-text)]">Options</div>
        <div class="flex flex-row gap-x-2">
          <Checkbox class="mx-1 my-auto" title="Enable build" bind:checked={kubeBuild} >
            <div>Enable build</div>
          </Checkbox>
          <Checkbox class="mx-1 my-auto" title="Replace" bind:checked={kubeReplace} >
            <div>Replace</div>
          </Checkbox>
        </div>
      </div>

      {#if !runFinished}
        <ButtonRow>
          {#if !runStarted}
            <Button
              on:click={playKubeFile}
              disabled={hasInvalidFields || runStarted}
              inProgress={runStarted}
              icon={KubePlayIcon}>
              {userChoice === 'custom' ? 'Play custom YAML' : 'Play'}
            </Button>
          {:else}
            <Button onclick={cancel} title="Cancel">
              Cancel
            </Button>
          {/if}
        </ButtonRow>
      {/if}
      {#if runStarted}
        <div class="text-[var(--pd-content-card-text)] text-sm">
          Please do not change screens while Play Kube executes. This process may take a few minutes to complete...
        </div>
      {/if}

      {#if runWarning}
        <WarningMessage class="text-sm" error={runWarning} />
      {/if}

      {#if runError}
        <ErrorMessage class="text-sm" error={runError} />
      {/if}

      {#if playKubeResult}
        <!-- Output area similar to DeployPodToKube.svelte -->
        <div class="bg-[var(--pd--content-card-bg)] p-5 my-4 text-[var(--pd-content-card-text)]">
          <div class="flex flex-row items-center">
            <div>
              {#if playKubeResult.Pods && playKubeResult.Pods.length > 1}
                Created pods:
              {:else}
                Created pod:
              {/if}
            </div>
          </div>

          <div class="h-[100px] pt-2">
            <MonacoEditor content={playKubeResultRaw} language="json" />
          </div>
        </div>
      {/if}

      {#if runFinished}
        <ButtonRow>
          <Button onclick={goBackToPodsPage}>Done</Button>
        </ButtonRow>
      {/if}
    </div>
    {/snippet}
  </EngineFormPage>
{/if}
