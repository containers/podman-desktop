<script lang="ts">
/* eslint-disable no-useless-escape */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import { NavigationPage } from '@desktop-framework/api';
import type { OpenDialogOptions } from '@desktop-framework/extension-api';
import { faCube, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow, Checkbox, Input } from '@podman-desktop/ui-svelte';
import { onDestroy } from 'svelte';
import { get, type Unsubscriber } from 'svelte/store';

import ContainerConnectionDropdown from '/@/lib/forms/ContainerConnectionDropdown.svelte';
import EngineFormPage from '/@/lib/ui/EngineFormPage.svelte';
import FileInput from '/@/lib/ui/FileInput.svelte';
import TerminalWindow from '/@/lib/ui/TerminalWindow.svelte';
import { handleNavigation } from '/@/navigation';
import {
  type BuildImageInfo,
  buildImagesInfo,
  cloneBuildImageInfo,
  createDefaultBuildImageInfo,
  getNextTaskId,
  lastUpdatedTaskId,
} from '/@/stores/build-images';
import { providerInfos } from '/@/stores/providers';

import { type BuildImageCallback, disconnectUI, eventCollect, reconnectUI, startBuild } from './build-image-task';
import BuildImageFromContainerfileCards from './BuildImageFromContainerfileCards.svelte';
import BuildTargetDropdown from './BuildTargetDropdown.svelte';
import RecommendedRegistry from './RecommendedRegistry.svelte';

interface Props {
  taskId?: number;
}

let { taskId = $bindable() }: Props = $props();
let buildImageInfo: BuildImageInfo = $state(createDefaultBuildImageInfo());
let validateRegistries = $state(true);

const containerFileDialogOptions: OpenDialogOptions = {
  title: 'Select Containerfile to build',
};
const contextDialogOptions: OpenDialogOptions = { title: 'Select Root Context', selectors: ['openDirectory'] };

interface BuildOutputItem {
  stream?: string;
  aux?: {
    ID: string;
  };
}

type BuildOutput = BuildOutputItem[];

let formattedBuildArgs: Record<string, string> = {};

function addBuildArg(): void {
  buildImageInfo.buildArgs = [...buildImageInfo.buildArgs, { key: '', value: '' }];
}

function deleteBuildArg(index: number): void {
  buildImageInfo.buildArgs = buildImageInfo.buildArgs.filter((_, i) => i !== index);
}

function getTerminalCallback(): BuildImageCallback {
  const imageRegexp = RegExp(/docker:\/\/(?<imageName>.*?):\s/);
  return {
    onStream: function (data: string = ''): void {
      buildImageInfo.logsTerminal?.write(`${data}\r`);
    },
    onError: function (error: string): void {
      buildImageInfo.buildError = error;

      // need to extract image from there
      // it should match the pattern 'initializing source docker://registry.redhat.io/rhel9/postgresql-13:latest' and keep the value 'registry.redhat.io/rhel9/postgresql-13:latest'
      const imageRegexpRes = imageRegexp.exec(buildImageInfo.buildError);
      // if we found the image name, we should store it
      const findingImageName = imageRegexpRes?.groups?.imageName;
      if (findingImageName) {
        buildImageInfo.buildParentImageName = findingImageName;
      }
      buildImageInfo.logsTerminal?.write(`Error:${error}\r\n`);
    },
    onEnd: function (): void {
      // dispatch event to reload images list when image build is done
      window.dispatchEvent(new CustomEvent('image-build', { detail: { name: buildImageInfo.containerImageName } }));
    },
  };
}

async function buildContainerImage(): Promise<void> {
  buildImageInfo.buildParentImageName = undefined;
  buildImageInfo.buildError = undefined;
  buildImageInfo.logsTerminal?.reset();

  // Create the formatted build arguments that will be used when passing to buildImage
  formattedBuildArgs = buildImageInfo.buildArgs.reduce<Record<string, string>>((acc, { key, value }) => {
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});

  // Pick if we are building a singular platform (which will just create the image)
  // or multiple platforms (which will create the image and then create a manifest)
  if (platforms.length === 1) {
    await buildSinglePlatformImage(); // Single platform build
  } else if (platforms.length > 1) {
    await buildMultiplePlatformImagesAndCreateManifest(); // Multiple platforms build
  }
}

// Function to handle the building of a container image for a single platform
// Can be running in current page or in background without page
async function buildSinglePlatformImage(): Promise<void> {
  buildImageInfo.buildFinished = false;
  buildImageInfo.buildImageKey = startBuild(getTerminalCallback());
  buildImageInfo.buildRunning = true;

  // Extract the relative path from the containerFilePath and containerBuildContextDirectory
  const relativeContainerfilePath = await window.pathRelative(
    buildImageInfo.containerBuildContextDirectory,
    buildImageInfo.containerFilePath,
  );

  buildImageInfo.cancellableTokenId = await window.getCancellableTokenSource();

  buildImagesInfo.update(map => {
    taskId = getNextTaskId();
    buildImageInfo.taskId = taskId;
    return map.set(buildImageInfo.taskId, buildImageInfo);
  });
  try {
    if (!buildImageInfo.selectedProvider) {
      throw new Error('There is no container engine available.');
    }
    // Build the singular image
    await window.buildImage(
      buildImageInfo.containerBuildContextDirectory,
      relativeContainerfilePath,
      buildImageInfo.containerImageName,
      buildImageInfo.containerBuildPlatform,
      $state.snapshot(buildImageInfo.selectedProvider),
      buildImageInfo.buildImageKey,
      eventCollect,
      buildImageInfo.cancellableTokenId,
      formattedBuildArgs,
      buildImageInfo.taskId,
      buildImageInfo.target,
      validateRegistries,
    );
  } catch (error) {
    eventCollect(buildImageInfo.buildImageKey, 'error', String(error));
  }
  buildImagesInfo.update(map => {
    buildImageInfo.cancellableTokenId = undefined;
    buildImageInfo.buildRunning = false;
    buildImageInfo.buildFinished = true;
    $lastUpdatedTaskId = buildImageInfo.taskId;
    return map.set(buildImageInfo.taskId, buildImageInfo);
  });
  $lastUpdatedTaskId = undefined; // in case nobody is listening
}

// Function to handle the building of container images for multiple platforms and creating a manifest
// afterwards
async function buildMultiplePlatformImagesAndCreateManifest(): Promise<void> {
  buildImageInfo.buildFinished = false;
  buildImageInfo.buildImageKey = startBuild(getTerminalCallback());
  buildImageInfo.buildRunning = true;

  // Collection of build IDs, this is needed for being able to create the manifest
  // as we need to know either the IDs or the names of the images that were built
  let buildIDs = [];

  // Extract the relative path from the containerFilePath and containerBuildContextDirectory
  const relativeContainerfilePath = await window.pathRelative(
    buildImageInfo.containerBuildContextDirectory,
    buildImageInfo.containerFilePath,
  );

  buildImageInfo.cancellableTokenId = await window.getCancellableTokenSource();

  // We'll be using the same terminal for all builds (getTerminalCallback)
  // similar to how Podman CLI does it.

  buildImagesInfo.update(map => {
    taskId = getNextTaskId();
    buildImageInfo.taskId = taskId;
    return map.set(buildImageInfo.taskId, buildImageInfo);
  });
  try {
    // We'll iterate over each platform and build the image
    for (const platform of platforms) {
      if (!buildImageInfo.selectedProvider) {
        throw new Error('There is no container engine available.');
      }
      // Store the key
      // Build the image for the current platform
      // NOTE: We purposely pass in '' as the container name so that the built image is
      // <none> in the image list similar to the Podman CLI.
      const buildOutput: BuildOutput = (await window.buildImage(
        buildImageInfo.containerBuildContextDirectory,
        relativeContainerfilePath,
        undefined, // Omitting the image name for multi-platform builds, as we'll be creating a singular manifest.
        platform,
        $state.snapshot(buildImageInfo.selectedProvider),
        buildImageInfo.buildImageKey,
        eventCollect,
        buildImageInfo.cancellableTokenId,
        formattedBuildArgs,
        buildImageInfo.taskId,
        buildImageInfo.target,
        validateRegistries,
      )) as BuildOutput;

      // Extract and store the build ID as this is required for creating the manifest, only if it is available.

      if (buildOutput) {
        const buildIdItem = buildOutput.find(o => o.aux);
        const buildId = buildIdItem ? buildIdItem?.aux?.ID : undefined;
        if (buildId) {
          buildIDs.push(buildId.replace('sha256:', 'containers-storage:'));
        }
      }
    }
    await window.createManifest({
      images: buildIDs,
      name: buildImageInfo.containerImageName!,
    });
  } catch (error) {
    eventCollect(buildImageInfo.buildImageKey, 'error', `${String(error)}\r\n`);
  }
  buildImagesInfo.update(map => {
    buildImageInfo.cancellableTokenId = undefined;
    buildImageInfo.buildRunning = false;
    buildImageInfo.buildFinished = true;
    $lastUpdatedTaskId = buildImageInfo.taskId;
    return map.set(buildImageInfo.taskId, buildImageInfo);
  });
  $lastUpdatedTaskId = undefined; // in case nobody is listening
}

function cleanupBuild(): void {
  handleNavigation({ page: NavigationPage.IMAGES });
}

// when subscribe callback called first time during initialization or
// from background build the taskId is NaN
let buildImagesInfoUnsubscriber: Unsubscriber = buildImagesInfo.subscribe(map => {
  if ($lastUpdatedTaskId && $lastUpdatedTaskId === taskId) {
    // change event came from loaded page
    if (buildImageInfo.buildFinished) {
      buildImageInfo = cloneBuildImageInfo(buildImageInfo);
      taskId = 0;
    }
  }
  if (taskId && buildImageInfo.taskId === 0) {
    // initial loading
    const bgBuildImageInfo = map.get(taskId);
    if (bgBuildImageInfo?.buildFinished) {
      buildImageInfo = cloneBuildImageInfo(bgBuildImageInfo);
      taskId = 0;
    } else if (bgBuildImageInfo) {
      buildImageInfo = bgBuildImageInfo;
    }
  }
  $lastUpdatedTaskId = undefined;
});

function onInit(): void {
  if (buildImageInfo.buildImageKey) {
    reconnectUI(buildImageInfo.buildImageKey, getTerminalCallback());
  }
}

onDestroy(() => {
  if (buildImageInfo.buildImageKey && !buildImageInfo.buildFinished) {
    disconnectUI(buildImageInfo.buildImageKey);
  }
  buildImagesInfoUnsubscriber();
});

async function abortBuild(): Promise<void> {
  if (buildImageInfo.cancellableTokenId) {
    await window.cancelToken(buildImageInfo.cancellableTokenId);
    buildImageInfo.cancellableTokenId = undefined;
  }
  buildImageInfo.buildRunning = false;
  buildImageInfo.buildFinished = true;
}

let platforms = $derived(buildImageInfo.containerBuildPlatform ? buildImageInfo.containerBuildPlatform.split(',') : []);

let providerConnections = $derived(
  $providerInfos.reduce<ProviderContainerConnectionInfo[]>((acc, provider) => {
    const startedConnections = provider.containerConnections.filter(connection => connection.status === 'started');
    return acc.concat(startedConnections);
  }, []),
);
let selectedProvider = $derived(providerConnections.length > 0 ? providerConnections[0] : undefined);
$effect(() => {
  if (taskId && taskId !== buildImageInfo.taskId) {
    // switching previous task which could be finished or still running
    if (buildImageInfo.buildImageKey) {
      // disconnect UI regardless of state
      disconnectUI(buildImageInfo.buildImageKey);
    }
    buildImageInfo.logsTerminal?.reset(); // clean up terminal before loading the state
    const buildImagesInfoMap = get(buildImagesInfo); // get background task states
    const bgBuildImageInfo = buildImagesInfoMap.get(taskId); // get state for loading task
    if (bgBuildImageInfo) {
      bgBuildImageInfo.logsTerminal = buildImageInfo.logsTerminal;
      if (bgBuildImageInfo.buildRunning) {
        buildImageInfo = bgBuildImageInfo;
      } else {
        buildImageInfo = cloneBuildImageInfo(bgBuildImageInfo);
        taskId = 0;
      }
      if (buildImageInfo.buildImageKey) {
        reconnectUI(buildImageInfo.buildImageKey, getTerminalCallback());
      }
    }
  }
  if (buildImageInfo.containerFilePath && !buildImageInfo.containerBuildContextDirectory) {
    // select the parent directory of the file as default
    buildImageInfo.containerBuildContextDirectory = buildImageInfo.containerFilePath
      .replace(/\\/g, '/')
      .replace(/\/[^\/]*$/, '');
  }
  buildImageInfo.selectedProvider = selectedProvider;
});

let errorContainerImageName = $derived(
  buildImageInfo.containerImageName === buildImageInfo.containerImageName.toLowerCase()
    ? undefined
    : 'Image name should be lowercase',
);

let hasInvalidFields = $derived(
  !buildImageInfo.containerFilePath ||
    !buildImageInfo.containerBuildContextDirectory ||
    (platforms.length > 1 && !buildImageInfo.containerImageName) ||
    platforms.length === 0 ||
    !!errorContainerImageName ||
    !selectedProvider,
);
</script>

<EngineFormPage
  title="Build image {buildImageInfo.containerImageName} from Containerfile"
  inProgress={buildImageInfo.buildRunning}
  showEmptyScreen={providerConnections.length === 0 && !buildImageInfo.buildRunning}>
  {#snippet icon()}
    <i class="fas fa-cube fa-2x" aria-hidden="true"></i>
  {/snippet}
  {#snippet content()}
    <div class="space-y-6">
      <div hidden={buildImageInfo.buildRunning}>
        <label for="containerFilePath" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
          >Containerfile path</label>
        <FileInput
          name="containerFilePath"
          id="containerFilePath"
          bind:value={buildImageInfo.containerFilePath}
          placeholder="Containerfile to build"
          options={containerFileDialogOptions}
          class="w-full" />
      </div>

      <div hidden={buildImageInfo.buildRunning}>
        <label
          for="containerBuildContextDirectory"
          class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]">Build context directory</label>
        <FileInput
          name="containerBuildContextDirectory"
          id="containerBuildContextDirectory"
          bind:value={buildImageInfo.containerBuildContextDirectory}
          placeholder="Directory to build in"
          options={contextDialogOptions}
          class="w-full" />
      </div>

      <div hidden={buildImageInfo.buildRunning}>
        <label for="containerImageName" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
          >Image name</label>
        <Input
          bind:value={buildImageInfo.containerImageName}
          name="containerImageName"
          id="containerImageName"
          placeholder="Image name (e.g. quay.io/namespace/my-custom-image)"
          error={errorContainerImageName}
          class="w-full" />
      </div>

      {#if buildImageInfo.containerFilePath}
        <div hidden={buildImageInfo.buildRunning}>
            <BuildTargetDropdown bind:target={buildImageInfo.target} containerFilePath={buildImageInfo.containerFilePath} />
        </div>
      {/if}

      {#if providerConnections.length > 1}
        <div hidden={buildImageInfo.buildRunning}>
          <label for="providerChoice" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
            >Container engine</label>
          <ContainerConnectionDropdown
            id="providerChoice"
            name="providerChoice"
            bind:value={buildImageInfo.selectedProvider}
            connections={providerConnections} />
        </div>
      {/if}

      <div hidden={buildImageInfo.buildRunning}>
        <label for="inputKey" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
          >Build arguments</label>
        {#each buildImageInfo.buildArgs as buildArg, index (index)}
          <div class="flex flex-row items-center space-x-2 mb-2">
            <Input bind:value={buildArg.key} name="inputKey" placeholder="Key" class="grow" required />
            <Input bind:value={buildArg.value} placeholder="Value" class="grow" required />
            <Button
              on:click={(): void => deleteBuildArg(index)}
              icon={faMinusCircle}
              disabled={buildImageInfo.buildArgs.length === 1 && buildArg.key === '' && buildArg.value === ''}
              aria-label="Delete build argument" />
            <Button on:click={addBuildArg} icon={faPlusCircle} title="Add build argument" aria-label="Add build argument" />
          </div>
        {/each}
      </div>

      <div hidden={buildImageInfo.buildRunning}>
        <label for="containerBuildPlatform" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
          >Platform</label>
        {#if platforms.length > 1}
          <p class="text-[var(--pd-content-text)] mb-2">Multiple platforms selected, a manifest will be created</p>
        {/if}
        <BuildImageFromContainerfileCards bind:platforms={buildImageInfo.containerBuildPlatform} />
      </div>

      <div hidden={buildImageInfo.buildRunning}>
        <label for="registryValidation" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
          >Registry Validation</label>
        <Checkbox bind:checked={validateRegistries} title='validate registries'>Validate registries before building</Checkbox>
      </div>

      <ButtonRow>
        {#if !buildImageInfo.buildRunning}
          <Button on:click={buildContainerImage} disabled={hasInvalidFields} icon={faCube}>Build</Button>
        {/if}

        {#if buildImageInfo.buildFinished}
          <Button on:click={cleanupBuild}>Done</Button>
        {/if}
      </ButtonRow>

      <RecommendedRegistry
        bind:imageError={buildImageInfo.buildError}
        imageName={buildImageInfo.buildParentImageName} />

      <TerminalWindow on:init={onInit} bind:terminal={buildImageInfo.logsTerminal} />
      <ButtonRow>
        {#if buildImageInfo.buildRunning}
          <Button on:click={abortBuild}>Cancel</Button>
        {/if}
      </ButtonRow>
    </div>
  {/snippet}
</EngineFormPage>
