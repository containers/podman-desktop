<script lang="ts">
import { faCodeBranch, faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';

import type { ExtensionDetailsUI } from './extension-details-ui';
import ExtensionAutoUpdate from './ExtensionAutoUpdate.svelte';
import ExtensionDetailsSummaryCardEntry from './InstalledExtensionDetailsSummaryCardEntry.svelte';

interface Props {
  extensionDetails: ExtensionDetailsUI;
}

let { extensionDetails }: Props = $props();

function normalizeExternalUrl(url: string): string {
  // npm package.json repository URLs can be prefixed with "git+".
  return url.startsWith('git+') ? url.slice(4) : url;
}

const repositoryUrl = $derived(
  typeof extensionDetails.repository === 'string'
    ? normalizeExternalUrl(extensionDetails.repository)
    : extensionDetails.repository?.url
      ? normalizeExternalUrl(extensionDetails.repository.url)
      : undefined,
);

const hasResources = $derived(Boolean(repositoryUrl) || Boolean(extensionDetails.homepage));
</script>

<div class="order-first lg:order-last w-full lg:w-48 flex flex-row grow justify-end pb-4 lg:pb-0">
  <div
    class="bg-[var(--pd-details-card-bg)] lg:w-40 h-fit lg:ml-4 p-4 rounded-md flex flex-row lg:flex-col w-full space-x-4 lg:space-x-0">
    <ExtensionDetailsSummaryCardEntry label="version" value={extensionDetails.version} />

    {#if extensionDetails.installedExtension}
      <ExtensionAutoUpdate extension={extensionDetails.installedExtension} />
    {/if}

    <ExtensionDetailsSummaryCardEntry label="released" value={extensionDetails.releaseDate} />

    <ExtensionDetailsSummaryCardEntry label="published by" value={extensionDetails.publisherDisplayName} />

    {#if extensionDetails.categories.length > 0}
      <ExtensionDetailsSummaryCardEntry label="categories" value={extensionDetails.categories.join(', ')} />
    {/if}

    {#if hasResources}
      <div class="flex flex-col items-start gap-1">
        <div class="uppercase text-sm text-[var(--pd-details-card-header)]">resources</div>
        {#if repositoryUrl}
          <Tooltip top tip={repositoryUrl}>
            <!-- Native anchor keeps browser/electron context-menu options (e.g. copy link). -->
            <a
              href={repositoryUrl}
              class="text-[var(--pd-link)] hover:bg-[var(--pd-link-hover-bg)] transition-all rounded-[4px] p-0.5 no-underline cursor-pointer flex flex-row items-center gap-1 text-sm"
              onclick={async (): Promise<void> => window.openExternal(repositoryUrl)}>
              <span aria-hidden="true">
                <Icon icon={faCodeBranch} size="sm" />
              </span>
              Repository
            </a>
          </Tooltip>
        {/if}
        {#if extensionDetails.homepage}
          {@const homepageUrl = extensionDetails.homepage}
          <Tooltip top tip={homepageUrl}>
            <!-- Native anchor keeps browser/electron context-menu options (e.g. copy link). -->
            <a
              href={homepageUrl}
              class="text-[var(--pd-link)] hover:bg-[var(--pd-link-hover-bg)] transition-all rounded-[4px] p-0.5 no-underline cursor-pointer flex flex-row items-center gap-1 text-sm"
              onclick={async (): Promise<void> => window.openExternal(homepageUrl)}>
              <span aria-hidden="true">
                <Icon icon={faExternalLink} size="sm" />
              </span>
              Homepage
            </a>
          </Tooltip>
        {/if}
      </div>
    {/if}
  </div>
</div>
