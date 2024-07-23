<script lang="ts">
import type { ProviderLinks } from '@podman-desktop/api';
import { Page } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import { lastPage } from '../../stores/breadcrumb';
import { providerInfos } from '../../stores/providers';

$: contributedLinks = $providerInfos
  .filter(provider => provider.status === 'ready' || provider.status === 'started')
  .filter(provider => provider.links.length > 0)
  .flatMap(provider => provider.links)
  .reduce((links: Map<string, ProviderLinks[]>, link) => {
    if (link['group'] === undefined) return links;
    if (!links.has(link['group'])) {
      links = links.set(link['group'], []);
    }
    links.get(link['group'])?.push(link);
    return links;
  }, new Map<string, ProviderLinks[]>());

export function goToPreviousPage(): void {
  router.goto($lastPage.path);
}
</script>

<Page title="Help" on:close={goToPreviousPage}>
  <i slot="icon" class="fas fa-question-circle fa-2x" aria-hidden="true"></i>
  <div slot="content" class="min-w-full h-full p-5 overflow-auto">
    <div class="min-w-full space-y-5">
      <!-- Getting Started -->
      <div class="bg-[var(--pd-global-nav-bg)] px-3 pt-3 pb-3 rounded-lg">
        <div class="text-[var(--pd-content-header)] text-lg">Getting Started</div>
        <div class="grid grid-cols-1 md:grid-cols-2 py-3">
          <button
            class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer md:border-r-2 text-[var(--pd-button-help-link-text)]"
            on:click={() => window.openExternal('https://podman-desktop.io/docs/intro')}
            title="https://podman-desktop.io/docs/intro">
            <p class="py-2 md:text-ellipsis md:overflow-hidden">Getting started</p>
            <i
              class="opacity-0 group-hover:opacity-100 fas fa-solid fa-external-link-alt ml-2 transition-opacity delay-150 duration-150 ease-in-out"
              aria-hidden="true"></i>
          </button>
          <button
            class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer md:place-content-end md:ml-2 text-[var(--pd-button-help-link-text)]"
            on:click={() => window.openExternal('https://podman-desktop.io/docs/troubleshooting')}
            title="https://podman-desktop.io/docs/troubleshooting">
            <p class="py-2 md:text-ellipsis md:overflow-hidden">Troubleshooting guide</p>
            <i
              class="opacity-0 group-hover:opacity-100 fas fa-solid fa-external-link-alt ml-2 transition-opacity delay-150 duration-150 ease-in-out"
              aria-hidden="true"></i>
          </button>
          <button
            class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer md:border-r-2 text-[var(--pd-button-help-link-text)]"
            on:click={() => window.openExternal('https://podman-desktop.io/features')}
            title="https://podman-desktop.io/features">
            <p class="py-2 md:text-ellipsis md:overflow-hidden">View all features</p>
            <i
              class="opacity-0 group-hover:opacity-100 fas fa-solid fa-external-link-alt ml-2 transition-opacity delay-150 duration-150 ease-in-out"
              aria-hidden="true"></i>
          </button>
          <button
            class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer md:place-content-end md:ml-2 text-[var(--pd-button-help-link-text)]"
            on:click={() => window.openExternal('https://podman-desktop.io/extend')}
            title="https://podman-desktop.io/extend">
            <p class="py-2 md:text-ellipsis md:overflow-hidden">Extend podman desktop</p>
            <i
              class="opacity-0 group-hover:opacity-100 fas fa-solid fa-external-link-alt ml-2 transition-opacity delay-150 duration-150 ease-in-out"
              aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <!-- Contributed Links -->
      {#if contributedLinks.size > 0}
        {#each [...contributedLinks] as [group, links]}
          {#if links.length > 0}
            <div class="bg-[var(--pd-global-nav-bg)] px-3 pt-3 pb-3 rounded-lg">
              <div class="text-[var(--pd-content-header)] text-lg">{group}</div>
              <div class="grid grid-cols-1 md:grid-cols-2 py-3">
                {#each links as link, index}
                  {@const evenItems = index % 2 !== 0}
                  <button
                    class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer text-[var(--pd-button-help-link-text)] {evenItems
                      ? 'md:place-content-end md:ml-2'
                      : 'md:border-r-2'}"
                    on:click={() => window.openExternal(link.url)}
                    title={link.url}>
                    <p class="py-2 md:text-ellipsis md:overflow-hidden">
                      {link.title}
                    </p>
                    <i
                      class="opacity-0 group-hover:opacity-100 fas fa-solid fa-external-link-alt ml-2 transition-opacity delay-150 duration-150 ease-in-out"
                      aria-hidden="true"></i>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      {/if}

      <!-- Get in Touch -->
      <div class="bg-[var(--pd-global-nav-bg)] px-3 pt-3 pb-3 rounded-lg">
        <div class="text-[var(--pd-content-header)] text-lg">Get in Touch</div>
        <div class="grid grid-cols-1 md:grid-cols-2 py-3">
          <button
            class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer md:border-r-2 text-[var(--pd-button-help-link-text)]"
            on:click={() => window.openExternal('https://github.com/containers/podman-desktop/issues/new/choose')}
            title="https://github.com/containers/podman-desktop/issues/new/choose">
            <p class="py-2 md:text-ellipsis md:overflow-hidden">Report a bug</p>
            <i
              class="opacity-0 group-hover:opacity-100 fas fa-solid fa-exclamation-triangle ml-2 transition-opacity delay-150 duration-150 ease-in-out"
              aria-hidden="true"></i>
          </button>
          <button
            class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer md:place-content-end md:ml-2 text-[var(--pd-button-help-link-text)]"
            on:click={() =>
              window.openExternal('https://github.com/containers/podman-desktop/discussions/categories/general')}
            title="https://github.com/containers/podman-desktop/discussions/categories/general">
            <p class="py-2 md:text-ellipsis md:overflow-hidden">Create a GitHub discussion</p>
            <i
              class="opacity-0 group-hover:opacity-100 fas fa-solid fa-exclamation-triangle ml-2 transition-opacity delay-150 duration-150 ease-in-out"
              aria-hidden="true"></i>
          </button>
          <button
            class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer md:border-r-2 text-[var(--pd-button-help-link-text)]"
            on:click={() => window.events.send('display-feedback', '')}
            title="Share your Feedback">
            <p class="py-2 md:text-ellipsis md:overflow-hidden">Share your Feedback</p>
            <i
              class="opacity-0 group-hover:opacity-100 fas fa-solid fa-comment ml-2 transition-opacity delay-150 duration-150 ease-in-out"
              aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <!-- Communication -->
      <div class="bg-[var(--pd-global-nav-bg)] px-3 pt-3 pb-3 rounded-lg">
        <div class="text-[var(--pd-content-header)] text-lg">Communication</div>
        <div class="grid grid-cols-1 md:grid-cols-2 py-3">
          <button
            class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer md:border-r-2 text-[var(--pd-button-help-link-text)]"
            on:click={() => window.openExternal('https://discord.com/invite/x5GzFF6QH4')}
            title="https://discordapp.com/invite/TCTB38RWpf">
            <p class="py-2 md:text-ellipsis md:overflow-hidden">Discord: Join #general channel</p>
            <i
              class="opacity-0 group-hover:opacity-100 fas fa-solid fa-comments ml-2 transition-opacity delay-150 duration-150 ease-in-out"
              aria-hidden="true"></i>
          </button>
          <button
            class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer md:place-content-end md:ml-2 text-[var(--pd-button-help-link-text)]"
            on:click={() => window.openExternal('https://libera.chat')}
            title="https://libera.chat">
            <p class="py-2 md:text-ellipsis md:overflow-hidden">Libera.Chat: Join #podman-desktop channel</p>
            <i
              class="opacity-0 group-hover:opacity-100 fas fa-solid fa-comments ml-2 transition-opacity delay-150 duration-150 ease-in-out"
              aria-hidden="true"></i>
          </button>
          <button
            class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer md:border-r-2 text-[var(--pd-button-help-link-text)]"
            on:click={() => window.openExternal('https://fedora.im')}
            title="https://fedora.im">
            <p class="py-2 md:text-ellipsis md:overflow-hidden">Matrix: Join #podman-desktop channel</p>
            <i
              class="opacity-0 group-hover:opacity-100 fas fa-solid fa-comments ml-2 transition-opacity delay-150 duration-150 ease-in-out"
              aria-hidden="true"></i>
          </button>
          <button
            class="group flex items-baseline md:text-right w-full md:whitespace-nowrap pr-2 cursor-pointer md:place-content-end md:ml-2 text-[var(--pd-button-help-link-text)]"
            on:click={() => window.openExternal('https://slack.k8s.io')}
            title="https://slack.k8s.io">
            <p class="py-2 md:text-ellipsis md:overflow-hidden">Slack: Join #podman-desktop channel</p>
            <i
              class="opacity-0 group-hover:opacity-100 fas fa-solid fa-comments ml-2 transition-opacity delay-150 duration-150 ease-in-out"
              aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</Page>
