<script lang="ts">
import 'ninja-keys';
import './app.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import './override.css';
import { Route, router } from 'tinro';

import { containersInfos } from './stores/containers';
import { imagesInfos } from './stores/images';
import ContainerList from './lib/ContainerList.svelte';
import { CommandRegistry } from './lib/CommandRegistry';
import { onMount } from 'svelte';
import ExtensionList from './lib/ExtensionList.svelte';
import ImagesList from './lib/ImagesList.svelte';
import ProviderList from './lib/ProviderList.svelte';
let containersCountValue;

router.mode.hash();
let innerWidth = 0;

onMount(async () => {
  const commandRegistry = new CommandRegistry();
  commandRegistry.init();
  containersInfos.subscribe(value => {
    containersCountValue = value.length;
  });
});

function jumpToImages() {
  console.log('click on images...');
  window.location.href = '#/images';
}
</script>

<svelte:window bind:innerWidth />
<Route path="/*" breadcrumb="Home" let:meta>
  <main class="min-h-screen flex flex-col h-screen bg-gray-800">
    <ninja-keys id="command-palette" placeholder="" openHotkey="F1" hideBreadcrumbs class="dark"></ninja-keys>

    <header id="navbar" class="text-gray-400 bg-zinc-900 body-font" style="-webkit-app-region: drag;">
      <div class="container flex mx-auto flex-col p-2 items-center">
        <div class="flex lg:w-1/5 flex-wrap items-center text-base ml-auto"></div>
        <div
          class="flex order-none title-font font-medium items-center text-white align-middle justify-center mb-4 md:mb-0">
          <svg width="33" height="40" viewBox="0 0 33 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 16.5L30.5021 23.5687L15 36.5L0.497832 24.4313L15 16.5Z" fill="#C4C4C4"></path>
            <path d="M15.5022 11.7033L31.0043 18.772L15.5022 31.7033L1.00003 19.6346L15.5022 11.7033Z" fill="#E9E9E9"
            ></path>
            <path d="M15.5022 11.7033L31.0043 18.772L15.5022 31.7033L1.00003 19.6346L15.5022 11.7033Z" fill="#E9E9E9"
            ></path>
            <path d="M15.5022 5.70331L31.0043 12.772L15.5022 25.7033L1.00003 13.6346L15.5022 5.70331Z" fill="#7A59FA"
            ></path>
          </svg>

          <span class="ml-3 text-xl block text-gray-300">Container Desktop</span>
        </div>
        <div class="lg:w-2/5 inline-flex lg:justify-end ml-5 lg:ml-0"></div>
      </div>
    </header>

    <div class="overflow-x-hidden flex flex-1">
      <nav
        class="pf-c-nav z-0 group w-12 md:w-52 hover:w-52  shadow  flex-col justify-between sm:flex transition-all duration-500 ease-in-out"
        aria-label="Global">
        <ul class="pf-c-nav__list">
          <li
            class="pf-c-nav__item flex w-full justify-between {meta.url === '/containers' || meta.url === '/'
              ? 'dark:text-white pf-m-current'
              : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
            <a href="/containers" class="pf-c-nav__link flex items-center align-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="pt-1 md:hidden icon icon-tabler icon-tabler-grid"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z"></path>
                <rect x="4" y="4" width="6" height="6" rx="1"></rect>
                <rect x="14" y="4" width="6" height="6" rx="1"></rect>
                <rect x="4" y="14" width="6" height="6" rx="1"></rect>
                <rect x="14" y="14" width="6" height="6" rx="1"></rect>
              </svg>
              <span class="hidden md:block group-hover:block mr-5">Containers</span>

              {#if containersCountValue > 0}
                {#if innerWidth >= 768}
                  <span class="pf-c-badge pf-m-read hidden group-hover:flex md:flex items-center justify-center"
                    >{containersCountValue}</span>
                {/if}
              {/if}
            </a>
          </li>
          <li
            class="pf-c-nav__item flex w-full justify-between {meta.url === '/images'
              ? 'dark:text-white pf-m-current'
              : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
            <a href="/images" class="pf-c-nav__link">
              <svg
                class="pt-1 md:hidden icon icon-tabler icon-tabler-puzzle"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                ></path
                ></svg>

              <span class="hidden md:block group-hover:block mr-5">Images</span>
              {#if innerWidth >= 768}
                {#if $imagesInfos.length > 0}
                  <span class="pf-c-badge pf-m-read hidden group-hover:flex md:flex items-center justify-center"
                    >{$imagesInfos.length}</span>
                {/if}
              {/if}
            </a>
          </li>
          <li
            class="pf-c-nav__item flex w-full justify-between {meta.url === '/providers'
              ? 'dark:text-white pf-m-current'
              : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
            <a href="/providers" class="pf-c-nav__link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="pt-1 md:hidden icon icon-tabler icon-tabler-compass"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z"></path>
                <polyline points="8 16 10 10 16 8 14 14 8 16"></polyline>
                <circle cx="12" cy="12" r="9"></circle>
              </svg>
              <span class="hidden md:block group-hover:block mr-5">Providers</span>
            </a>
          </li>
          <li
            class="pf-c-nav__item flex w-full justify-between {meta.url === '/extensions'
              ? 'dark:text-white pf-m-current'
              : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
            <a href="/extensions" class="pf-c-nav__link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="pt-1 md:hidden icon icon-tabler icon-tabler-puzzle"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z"></path>
                <path
                  d="M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1"
                ></path>
              </svg>
              <span class="hidden md:block group-hover:block mr-5">Extensions</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="w-full h-full bg-zinc-800 flex flex-col">
        <Route path="/containers">
          <ContainerList />
        </Route>
        <Route path="/images">
          <ImagesList />
        </Route>
        <Route path="/">
          <ContainerList />
        </Route>
        <Route path="/extensions">
          <ExtensionList />
        </Route>
        <Route path="/providers">
          <ProviderList />
        </Route>
      </div>
    </div>
  </main>
</Route>
