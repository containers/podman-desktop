<script lang="ts">
import type { CliToolInfo } from '@desktop-framework/api';
import { faCircleArrowDown, faCircleArrowUp, faCircleXmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Tooltip } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';

import Markdown from '/@/lib/markdown/Markdown.svelte';
import LoadingIconButton from '/@/lib/ui/LoadingIconButton.svelte';

import {
  type ConnectionCallback,
  eventCollect,
  registerConnectionCallback,
} from './preferences-connection-rendering-task';
import type { ILoadingStatus } from './Util';

interface Props {
  cliTool: CliToolInfo;
}
let { cliTool }: Props = $props();

let showError = $state<boolean>(false);
let errorMessage = $state<string>('');
let newVersion = $derived<string | undefined>(cliTool.newVersion);
let cliToolUpdateStatus = $derived<ILoadingStatus>({
  inProgress: false,
  status: cliTool.canUpdate ? 'toUpdate' : 'unknown',
  action: 'update',
});
let cliToolInstallStatus = $derived<ILoadingStatus>({
  inProgress: false,
  status: cliTool.canInstall ? 'toInstall' : 'unknown',
  action: 'install',
});
let cliToolUninstallStatus = $derived<ILoadingStatus>({
  inProgress: false,
  status: cliTool.canInstall ? 'toUninstall' : 'unknown',
  action: 'uninstall',
});

async function showTaskManager(): Promise<void> {
  // call the command show-task-manager'
  await window.executeCommand('show-task-manager');
}

async function update(cliTool: CliToolInfo): Promise<void> {
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

async function install(cliTool: CliToolInfo): Promise<void> {
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

async function uninstall(cliTool: CliToolInfo): Promise<void> {
  const result = await window.showMessageBox({
    title: `Uninstall ${cliTool.displayName}?`,
    type: 'danger',
    message: `Uninstall ${cliTool.displayName} ${cliTool.version} ?`,
    buttons: ['Uninstall', 'Cancel'],
  });

  if (result?.response !== 'Uninstall') {
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
    log: (): void => {},
    warn: (): void => {},
    error: (_args): void => {
      showError = true;
    },
    onEnd: (): void => {},
  };
}
</script>

<div
  role="row"
  class="bg-[var(--pd-invert-content-card-bg)] mb-5 rounded-md p-3 flex flex-col"
  aria-label={cliTool.displayName}>
  <div class="divide-x divide-[var(--pd-content-divider)] flex flex-row">
    <div>
      <!-- left col - cli-tool icon/name + "create new" button -->
      <div class="w-[170px] h-full flex flex-col justify-between">
        <div class="flex flex-row">
          {#if cliTool?.images?.icon}
            <Icon
              icon={cliTool.images.icon}
              title="{cliTool.name} logo"
              class="max-w-[40px] max-h-[40px] h-full shrink-0" />
          {:else if typeof cliTool.extensionInfo.icon === 'string'}
            <Icon
              icon={cliTool.extensionInfo.icon}
              title="{cliTool.name} logo"
              class="max-w-[40px] max-h-[40px] h-full shrink-0" />
          {/if}
          <span
            id={cliTool.id}
            class="my-auto ml-3 break-all font-semibold text-[var(--pd-invert-content-header-text)]"
            aria-label="cli-name">{cliTool.name}</span>
        </div>
        <div class="flex flex-row space-x-1 w-full">
          {#if !cliTool.version && cliTool.canInstall && cliToolInstallStatus}
            <div class="p-0.5 rounded-lg bg-[var(--pd-invert-content-bg)] w-fit">
              <LoadingIconButton
                action="install"
                clickAction={async (): Promise<void> => {
                  if (cliTool.canInstall) {
                    await install(cliTool);
                  }
                }}
                icon={faCircleArrowDown}
                state={cliToolInstallStatus}
                color="primary"
                tooltip={`Install ${cliTool.displayName}`} />
            </div>
          {/if}
          {#if cliTool.version && cliTool.canUpdate && cliToolUpdateStatus}
            <div class="p-0.5 rounded-lg bg-[var(--pd-invert-content-bg)] w-fit">
              <LoadingIconButton
                action="update"
                clickAction={async (): Promise<void> => {
                  if (cliTool.canUpdate) {
                    await update(cliTool);
                  }
                }}
                icon={faCircleArrowUp}
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
                clickAction={async (): Promise<void> => {
                  if (cliTool.canInstall) {
                    await uninstall(cliTool);
                  }
                }}
                icon={faTrash}
                state={cliToolUninstallStatus}
                color="secondary"
                tooltip={`Uninstall ${cliTool.displayName}`} />
            </div>
          {/if}
        </div>
      </div>
    </div>
    <!-- cli-tools columns -->
    <div class="grow flex-column divide-[var(--pd-content-divider)] ml-2">
      <span class="my-auto ml-3 break-words text-[var(--pd-invert-content-header-text)]" aria-label="cli-display-name"
        >{cliTool.displayName}</span>
      <div
        role="region"
        class="float-right text-[var(--pd-invert-content-card-text)] px-2 text-sm"
        aria-label="cli-registered-by">
        Registered by {cliTool.extensionInfo.label}
      </div>
      <div role="region" class="ml-3 mt-2 text-[var(--pd-invert-content-card-text)]">
        <div class="text-[var(--pd-invert-content-card-text)]">
          <Markdown markdown={cliTool.description} />
        </div>
        {#if cliTool.version}
          <div
            class="flex flex-row justify-between align-center bg-[var(--pd-invert-content-bg)] p-2 rounded-lg min-w-[320px] w-fit">
            <Tooltip containerClass="relative inline-block my-auto" bottomRight={true} tip="Path: {cliTool.path}">
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
                on:click={async (): Promise<void> => {
                  if (cliTool.canUpdate) {
                    await update(cliTool);
                  }
                }}
                title={`${cliTool.displayName} will be updated${cliTool.newVersion ? ' to ' + cliTool.newVersion : ''} `}
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
                on:click={async (): Promise<void> => {
                  if (cliTool.canInstall) {
                    await install(cliTool);
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
    <div class="flex flex-row items-center text-xs text-[var(--pd-state-error)] ml-[200px] mt-2">
      <Icon icon={faCircleXmark} class="mr-1 text-[var(--pd-state-error)]" />
      <span>{errorMessage}</span>
      <Button
        type="link"
        padding="p-0"
        class="ml-1 text-sm"
        aria-label="{cliTool.displayName} failed"
        on:click={showTaskManager}>Check why it failed</Button>
    </div>
  {/if}
</div>
