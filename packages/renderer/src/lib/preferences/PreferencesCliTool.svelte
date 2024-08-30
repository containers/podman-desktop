<script lang="ts">
import { faCircleArrowDown, faCircleArrowUp, faCircleXmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Tooltip } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

import type { CliToolInfo } from '/@api/cli-tool-info';

import Markdown from '../markdown/Markdown.svelte';
import LoadingIconButton from '../ui/LoadingIconButton.svelte';
import {
  type ConnectionCallback,
  eventCollect,
  registerConnectionCallback,
} from './preferences-connection-rendering-task';
import type { ILoadingStatus } from './Util';

export let cliTool: CliToolInfo;
let showError = false;
let errorMessage = '';
let newVersion: string | undefined = cliTool.newVersion;
let cliToolUpdateStatus: ILoadingStatus;
$: cliToolUpdateStatus = {
  inProgress: false,
  status: cliTool.canUpdate ? 'toUpdate' : 'unknown',
  action: 'update',
};
let cliToolInstallStatus: ILoadingStatus;
$: cliToolInstallStatus = {
  inProgress: false,
  status: cliTool.canInstall ? 'toInstall' : 'unknown',
  action: 'install',
};
let cliToolUninstallStatus: ILoadingStatus;
$: cliToolUninstallStatus = {
  inProgress: false,
  status: cliTool.canInstall ? 'toUninstall' : 'unknown',
  action: 'uninstall',
};

async function update(cliTool: CliToolInfo) {
  newVersion = cliTool.newVersion;
  if (!newVersion) {
    // user has to select the version to update to
    try {
      newVersion = await window.selectCliToolVersionToUpdate(cliTool.id);
    } catch (e) {
      // do nothing
      console.log(e);
    }
  }
  if (!newVersion) {
    return;
  }
  try {
    cliToolUpdateStatus.inProgress = true;
    cliToolUpdateStatus = cliToolUpdateStatus;
    const loggerHandlerKey = registerConnectionCallback(getLoggerHandler(cliTool.id));
    await window.updateCliTool(cliTool.id, loggerHandlerKey, newVersion, eventCollect);
    showError = false;
  } catch (e) {
    errorMessage = `Unable to update ${cliTool.displayName} to version ${newVersion}.`;
    showError = true;
  } finally {
    cliToolUpdateStatus.inProgress = false;
    cliToolUpdateStatus = cliToolUpdateStatus;
  }
}

async function install(cliTool: CliToolInfo) {
  // user has to select the version to install
  let versionToInstall;
  try {
    versionToInstall = await window.selectCliToolVersionToInstall(cliTool.id);
  } catch (e) {
    // do nothing
    errorMessage = `Error when selecting a version: ${String(e)}`;
    console.error(e);
    showError = true;
  }
  if (!versionToInstall) {
    return;
  }
  try {
    cliToolInstallStatus.inProgress = true;
    cliToolInstallStatus = cliToolInstallStatus;
    const loggerHandlerKey = registerConnectionCallback(getLoggerHandler(cliTool.id));
    await window.installCliTool(cliTool.id, versionToInstall, loggerHandlerKey, eventCollect);
    showError = false;
  } catch (e) {
    errorMessage = `Unable to install ${cliTool.displayName} to version ${versionToInstall}.`;
    showError = true;
  } finally {
    cliToolInstallStatus.inProgress = false;
    cliToolInstallStatus = cliToolInstallStatus;
  }
}

async function uninstall(cliTool: CliToolInfo) {
  const result = await window.showMessageBox({
    title: 'Uninstall',
    message: `Uninstall ${cliTool.displayName} ${cliTool.version} ?`,
    buttons: ['Yes', 'Cancel'],
  });

  if (!result || result.response !== 0) {
    return;
  }

  try {
    cliToolUninstallStatus.inProgress = true;
    cliToolUninstallStatus = cliToolUninstallStatus;
    const loggerHandlerKey = registerConnectionCallback(getLoggerHandler(cliTool.id));
    await window.uninstallCliTool(cliTool.id, loggerHandlerKey, eventCollect);
    showError = false;
  } catch (e) {
    errorMessage = `Unable to uninstall ${cliTool.displayName}. Error: ${String(e)}`;
    showError = true;
  } finally {
    cliToolUninstallStatus.inProgress = false;
    cliToolUninstallStatus = cliToolUninstallStatus;
  }
}

function getLoggerHandler(_cliToolId: string): ConnectionCallback {
  return {
    log: () => {},
    warn: () => {},
    error: _args => {
      showError = true;
    },
    onEnd: () => {},
  };
}
</script>

<div
  role="row"
  class="bg-[var(--pd-invert-content-card-bg)] mb-5 rounded-md p-3 flex flex-col"
  aria-label={cliTool.displayName}>
  <div class="divide-x divide-gray-900 flex flex-row">
    <div>
      <!-- left col - cli-tool icon/name + "create new" button -->
      <div class="min-w-[170px] max-w-[200px] h-full flex flex-col justify-between">
        <div class="flex flex-row">
          {#if cliTool?.images?.icon ?? cliTool?.extensionInfo.icon}
            {#if typeof cliTool.images?.icon === 'string'}
              <img
                src={cliTool.images.icon}
                aria-label="cli-logo"
                alt="{cliTool.name} logo"
                class="max-w-[40px] max-h-[40px] h-full" />
            {:else if typeof cliTool.extensionInfo.icon === 'string'}
              <img
                src={cliTool.extensionInfo.icon}
                aria-label="cli-logo"
                alt="{cliTool.name} logo"
                class="max-w-[40px] max-h-[40px] h-full" />
            {/if}
          {/if}
          <span
            id={cliTool.id}
            class="my-auto ml-3 break-words font-semibold text-[var(--pd-invert-content-header-text)]"
            aria-label="cli-name">{cliTool.name}</span>
        </div>
        <div class="flex flex-row space-x-1 w-full">
          {#if !cliTool.version && cliTool.canInstall && cliToolInstallStatus}
            <div class="p-0.5 rounded-lg bg-[var(--pd-invert-content-bg)] w-fit">
              <LoadingIconButton
                action="install"
                clickAction={() => {
                  if (cliTool.canInstall) {
                    install(cliTool);
                  }
                }}
                icon={faCircleArrowDown}
                leftPosition="left-[0.25rem]"
                state={cliToolInstallStatus}
                color="primary"
                tooltip={`Install ${cliTool.displayName}`} />
            </div>
          {/if}
          {#if cliTool.version && cliTool.canUpdate && cliToolUpdateStatus}
            <div class="p-0.5 rounded-lg bg-[var(--pd-invert-content-bg)] w-fit">
              <LoadingIconButton
                action="update"
                clickAction={() => {
                  if (cliTool.canUpdate) {
                    update(cliTool);
                  }
                }}
                icon={faCircleArrowUp}
                leftPosition="left-[0.25rem]"
                state={cliToolUpdateStatus}
                color="primary"
                tooltip={!cliTool.canUpdate
                  ? 'No updates'
                  : cliTool.newVersion
                    ? `Update to v${cliTool.newVersion}`
                    : 'Upgrade/Downgrade'} />
            </div>
          {/if}
          {#if cliTool.version && cliTool.canInstall && cliToolUninstallStatus}
            <div class="p-0.5 rounded-lg bg-[var(--pd-invert-content-bg)] w-fit">
              <LoadingIconButton
                action="uninstall"
                clickAction={() => {
                  if (cliTool.canInstall) {
                    uninstall(cliTool);
                  }
                }}
                icon={faTrash}
                leftPosition="left-[0.25rem]"
                state={cliToolUninstallStatus}
                color="secondary"
                tooltip={`Uninstall ${cliTool.displayName}`} />
            </div>
          {/if}
        </div>
      </div>
    </div>
    <!-- cli-tools columns -->
    <div class="grow flex-column divide-gray-900 ml-2">
      <span class="my-auto ml-3 break-words text-[var(--pd-invert-content-header-text)]" aria-label="cli-display-name"
        >{cliTool.displayName}</span>
      <div
        role="region"
        class="float-right text-[var(--pd-invert-content-card-text)] px-2 text-sm"
        aria-label="cli-registered-by">
        Registered by {cliTool.extensionInfo.label}
      </div>
      <div role="region" class="ml-3 mt-2 text-gray-300">
        <div class="text-[var(--pd-invert-content-card-text)]">
          <Markdown markdown={cliTool.description} />
        </div>
        {#if cliTool.version}
          <div
            class="flex flex-row justify-between align-center bg-[var(--pd-invert-content-bg)] p-2 rounded-lg min-w-[320px] w-fit">
            <Tooltip area-label="cli-full-path" bottomRight={true} tip="Path: {cliTool.path}">
              <div
                class="flex text-[var(--pd-invert-content-card-text)] font-bold text-sm items-center"
                aria-label="cli-version">
                {cliTool.name} v{cliTool.version}
              </div>
            </Tooltip>
            {#if cliTool.canUpdate}
              <Button
                type="link"
                class="underline"
                padding="p-0"
                on:click={() => {
                  if (cliTool.canUpdate) {
                    update(cliTool);
                  }
                }}
                title={`${cliTool.displayName} will be updated`}
                disabled={!cliTool.canUpdate}
                aria-label="Update available">
                {`${cliTool.newVersion ? 'Update available' : 'Upgrade/Downgrade'}`}
              </Button>
            {/if}
          </div>
        {:else}
          <div
            class="flex flex-row justify-between align-center bg-[var(--pd-invert-content-bg)] p-2 rounded-lg min-w-[320px] w-fit">
            <div
              class="flex text-[var(--pd-invert-content-card-text)] font-bold text-sm items-center"
              aria-label="no-cli-version">
              No version detected
            </div>
            {#if cliTool.canInstall}
              <Button
                type="link"
                class="underline"
                padding="p-0"
                on:click={() => {
                  if (cliTool.canInstall) {
                    install(cliTool);
                  }
                }}
                title={`${cliTool.displayName} will be installed`}
                disabled={!cliTool.canInstall}
                aria-label={`Install ${cliTool.displayName}`}>
                Install
              </Button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
  {#if showError}
    <div class="flex flex-row items-center text-xs text-red-400 ml-[200px] mt-2">
      <Fa icon={faCircleXmark} class="mr-1 text-red-500" />
      <span>{errorMessage}</span>
      <Button
        type="link"
        padding="p-0"
        class="ml-1 text-sm"
        aria-label="{cliTool.displayName} failed"
        on:click={() => window.events?.send('toggle-task-manager', '')}>Check why it failed</Button>
    </div>
  {/if}
</div>
