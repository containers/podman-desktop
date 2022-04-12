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
import Logo from './lib/logo/Logo.svelte';
import PreferencesPage from './lib/preferences/PreferencesPage.svelte';
import BuildImageFromContainerFile from './lib/image/BuildImageFromContainerFile.svelte';
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
  <Route path="/" redirect="/containers" />
  <main class="min-h-screen flex flex-col h-screen bg-gray-800">
    <ninja-keys id="command-palette" placeholder="" openHotkey="F1" hideBreadcrumbs class="dark"></ninja-keys>

    <header id="navbar" class="text-gray-400 bg-zinc-900 body-font" style="-webkit-app-region: drag;">
      <div class="container flex mx-auto flex-col p-2 items-center">
        <div class="flex lg:w-1/5 flex-wrap items-center text-base ml-auto"></div>
        <div
          class="flex order-none title-font font-medium items-center text-white align-middle justify-center mb-4 md:mb-0">
          <Logo />
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
          <!--
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
          -->
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
          <li
            class="pf-c-nav__item flex w-full justify-between {meta.url === '/preferences'
              ? 'dark:text-white pf-m-current'
              : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
            <a href="/preferences" class="pf-c-nav__link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="pt-1 md:hidden icon icon-tabler icon-tabler-puzzle"
                stroke-width="1.5"
                fill="currentColor"
                width="18"
                height="18"
                viewBox="0 0 512 512"
                ><path
                  d="M495.9 166.6C499.2 175.2 496.4 184.9 489.6 191.2L446.3 230.6C447.4 238.9 448 247.4 448 256C448 264.6 447.4 273.1 446.3 281.4L489.6 320.8C496.4 327.1 499.2 336.8 495.9 345.4C491.5 357.3 486.2 368.8 480.2 379.7L475.5 387.8C468.9 398.8 461.5 409.2 453.4 419.1C447.4 426.2 437.7 428.7 428.9 425.9L373.2 408.1C359.8 418.4 344.1 427 329.2 433.6L316.7 490.7C314.7 499.7 307.7 506.1 298.5 508.5C284.7 510.8 270.5 512 255.1 512C241.5 512 227.3 510.8 213.5 508.5C204.3 506.1 197.3 499.7 195.3 490.7L182.8 433.6C167 427 152.2 418.4 138.8 408.1L83.14 425.9C74.3 428.7 64.55 426.2 58.63 419.1C50.52 409.2 43.12 398.8 36.52 387.8L31.84 379.7C25.77 368.8 20.49 357.3 16.06 345.4C12.82 336.8 15.55 327.1 22.41 320.8L65.67 281.4C64.57 273.1 64 264.6 64 256C64 247.4 64.57 238.9 65.67 230.6L22.41 191.2C15.55 184.9 12.82 175.3 16.06 166.6C20.49 154.7 25.78 143.2 31.84 132.3L36.51 124.2C43.12 113.2 50.52 102.8 58.63 92.95C64.55 85.8 74.3 83.32 83.14 86.14L138.8 103.9C152.2 93.56 167 84.96 182.8 78.43L195.3 21.33C197.3 12.25 204.3 5.04 213.5 3.51C227.3 1.201 241.5 0 256 0C270.5 0 284.7 1.201 298.5 3.51C307.7 5.04 314.7 12.25 316.7 21.33L329.2 78.43C344.1 84.96 359.8 93.56 373.2 103.9L428.9 86.14C437.7 83.32 447.4 85.8 453.4 92.95C461.5 102.8 468.9 113.2 475.5 124.2L480.2 132.3C486.2 143.2 491.5 154.7 495.9 166.6V166.6zM256 336C300.2 336 336 300.2 336 255.1C336 211.8 300.2 175.1 256 175.1C211.8 175.1 176 211.8 176 255.1C176 300.2 211.8 336 256 336z"
                ></path
                ></svg>
              <span class="hidden md:block group-hover:block mr-5">Preferences</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="w-full h-full bg-zinc-800 flex flex-col">
        <Route path="/containers/*">
          <ContainerList />
        </Route>
        <Route path="/images">
          <ImagesList />
        </Route>
        <Route path="/images/build">
          <BuildImageFromContainerFile />
        </Route>
        <Route path="/extensions">
          <ExtensionList />
        </Route>
        <Route path="/providers">
          <ProviderList />
        </Route>
        <Route path="/preferences/*">
          <PreferencesPage />
        </Route>
      </div>
    </div>
  </main>
</Route>
