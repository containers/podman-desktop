<script lang="ts">
import 'ninja-keys';
      import './app.css'
      import '@patternfly/patternfly/patternfly.css'
      import '@patternfly/patternfly/patternfly-addons.css'
      import '@patternfly/patternfly/patternfly-theme-dark.css'
      import './override.css'
  import { Route, router} from 'tinro'; 
 
 import {containersInfos} from './stores/containers';
 import {imagesInfos} from './stores/images';
import ContainerList from './lib/ContainerList.svelte';
import {CommandRegistry} from './lib/CommandRegistry'
import { onMount } from "svelte";
import ExtensionList from './lib/ExtensionList.svelte';
import ImagesList from './lib/ImagesList.svelte';
import ProviderList from './lib/ProviderList.svelte';
let containersCountValue;

router.mode.hash()
let innerWidth = 0

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
<svelte:window bind:innerWidth/>
<Route path="/*" breadcrumb="Home" let:meta>
<main class="min-h-screen flex flex-col h-screen bg-gray-800">
  <ninja-keys id="command-palette" placeholder="" openHotkey="F1" hideBreadcrumbs class="dark"></ninja-keys>

  <header id="navbar" class="text-gray-400 bg-zinc-900 body-font" style="-webkit-app-region: drag;">
      <div class="container flex mx-auto flex-col p-2 items-center">
        <div class="flex lg:w-1/5 flex-wrap items-center text-base ml-auto">
        </div>
        <div class="flex order-none title-font font-medium items-center text-white align-middle justify-center mb-4 md:mb-0">
        <!--<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>-->

        <!--<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-10 h-10 text-indigo-300 p-1 rounded-full bg-indigo-900" viewBox="0 0 122.88 78.5" style="enable-background:new 0 0 122.88 78.5" xml:space="preserve"><g><path d="M48.17,0.36l73.7,13.39c0.54,0.1,1,0.45,1,1V63.6c0,0.55-0.46,0.91-1,1l-73.7,13.47c-0.54,0.1-1-0.45-1-1V1.36 C47.17,0.81,47.63,0.26,48.17,0.36L48.17,0.36z M0.69,7.06l10.03-1.67v67.59L0.69,71.28C0.31,71.21,0,70.97,0,70.59V7.75 C0,7.37,0.31,7.13,0.69,7.06L0.69,7.06z M14.6,4.74l11.44-1.91v72.75L14.6,73.65V4.74L14.6,4.74z M29.93,2.19l13.11-2.18 c0.37-0.06,0.69,0.31,0.69,0.69V77.8c0,0.38-0.31,0.75-0.69,0.69l-13.11-2.23V2.45V2.19L29.93,2.19z M119.34,18.2v42.05h-1.3V18.2 H119.34L119.34,18.2z M57.63,9.83v60.06h-3.89V8.63L57.63,9.83L57.63,9.83z M68.28,10.82V68.3h-3.57V10.36L68.28,10.82L68.28,10.82 z M77.81,12.36v54.33h-3.24V11.75L77.81,12.36L77.81,12.36z M86.31,13.69v51.83h-2.92V13.01L86.31,13.69L86.31,13.69z M94.15,14.95 v49.13h-2.6V14.41L94.15,14.95L94.15,14.95z M101.38,15.86v47.11h-2.27V15.34L101.38,15.86L101.38,15.86z M107.86,17.04v44.92 h-1.95V16.43L107.86,17.04L107.86,17.04z M113.9,18.06v42.97h-1.62V17.31L113.9,18.06L113.9,18.06z"/></g></svg>-->

<svg width="33" height="40" viewBox="0 0 33 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 16.5L30.5021 23.5687L15 36.5L0.497832 24.4313L15 16.5Z" fill="#C4C4C4"/>
  <path d="M15.5022 11.7033L31.0043 18.772L15.5022 31.7033L1.00003 19.6346L15.5022 11.7033Z" fill="#E9E9E9"/>
  <path d="M15.5022 11.7033L31.0043 18.772L15.5022 31.7033L1.00003 19.6346L15.5022 11.7033Z" fill="#E9E9E9"/>
  <path d="M15.5022 5.70331L31.0043 12.772L15.5022 25.7033L1.00003 13.6346L15.5022 5.70331Z" fill="#7A59FA"/>
  </svg>
  
        <span class="ml-3 text-xl block text-gray-300">Container Desktop</span>
</div>
      <div class="lg:w-2/5 inline-flex lg:justify-end ml-5 lg:ml-0">
        <!--
        <a class="mr-5 hover:text-white">First Link</a>
        <a class="mr-5 hover:text-white">Second Link</a>
        <a class="mr-5 hover:text-white">Third Link</a>
        <a class="hover:text-white">Fourth Link</a>-->
      </div>

    </div>
  </header>

  <div class="overflow-x-hidden flex flex-1">
    <nav class="pf-c-nav z-0 group w-12 md:w-52 hover:w-52  shadow  flex-col justify-between sm:flex transition-all duration-500 ease-in-out" aria-label="Global">
      <ul class="pf-c-nav__list">
        <li class="pf-c-nav__item flex w-full justify-between {meta.url === "/containers" || meta.url === '/' ? 'dark:text-white pf-m-current' : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
          <a href="/containers" class="pf-c-nav__link flex items-center align-middle">
            <svg xmlns="http://www.w3.org/2000/svg" class="pt-1 md:hidden icon icon-tabler icon-tabler-grid" width="18" height="18" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z"></path>
              <rect x="4" y="4" width="6" height="6" rx="1"></rect>
              <rect x="14" y="4" width="6" height="6" rx="1"></rect>
              <rect x="4" y="14" width="6" height="6" rx="1"></rect>
              <rect x="14" y="14" width="6" height="6" rx="1"></rect>
          </svg>
             <span class="hidden md:block group-hover:block mr-5">Containers</span>

             {#if containersCountValue > 0}
              {#if innerWidth >= 768}
                <span class="pf-c-badge pf-m-read hidden group-hover:flex md:flex items-center justify-center">{containersCountValue}</span>
              {/if}
            {/if}
            </a>
      </li>
        <li class="pf-c-nav__item flex w-full justify-between {meta.url === "/images" ? 'dark:text-white pf-m-current' : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
          <a
            href="/images"
            class="pf-c-nav__link"
          >
          <svg class="pt-1 md:hidden icon icon-tabler icon-tabler-puzzle" width="18" height="18" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>

          <span class="hidden md:block group-hover:block mr-5">Images</span>
          {#if innerWidth >= 768}
          {#if $imagesInfos.length > 0}
          <span class="pf-c-badge pf-m-read hidden group-hover:flex md:flex items-center justify-center">{$imagesInfos.length}</span>
          {/if}
          {/if}
         
        </a>
        </li>
        <li class="pf-c-nav__item flex w-full justify-between {meta.url === "/providers" ? 'dark:text-white pf-m-current' : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
          <a href="/providers" class="pf-c-nav__link">
            
            <svg xmlns="http://www.w3.org/2000/svg" class="pt-1 md:hidden icon icon-tabler icon-tabler-compass" width="18" height="18" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z"></path>
              <polyline points="8 16 10 10 16 8 14 14 8 16"></polyline>
              <circle cx="12" cy="12" r="9"></circle>
          </svg>
          <span class="hidden md:block group-hover:block mr-5">Providers</span>
      </a>
        </li>
        <li  class="pf-c-nav__item flex w-full justify-between {meta.url === "/extensions" ? 'dark:text-white pf-m-current' : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
          <a href="/extensions" class="pf-c-nav__link">
            <svg xmlns="http://www.w3.org/2000/svg" class="pt-1 md:hidden icon icon-tabler icon-tabler-puzzle" width="18" height="18" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z"></path>
              <path d="M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1"></path>
          </svg>
          <span class="hidden md:block group-hover:block mr-5">Extensions</span>
          </a>
        </li>
      </ul>
    </nav>
<!--
   <div class="z-0 group w-8 md:w-52 hover:w-52 bg-slate-900 shadow  flex-col justify-between sm:flex transition-all duration-500 ease-in-out ">
            <ul class="ml-2 mt-2 mr-2 mb-12">
                <li class="flex w-full justify-between {meta.url === "/containers" ? 'text-white' : 'text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
                    <a href="/containers" class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-grid" width="18" height="18" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z"></path>
                            <rect x="4" y="4" width="6" height="6" rx="1"></rect>
                            <rect x="14" y="4" width="6" height="6" rx="1"></rect>
                            <rect x="4" y="14" width="6" height="6" rx="1"></rect>
                            <rect x="14" y="14" width="6" height="6" rx="1"></rect>
                        </svg>
                        <span class="text-sm ml-2 hidden md:block group-hover:block">Containers</span>
                    </a>
                    {#if containersCountValue > 0}
                    <div class="py-1 px-3 bg-gray-600 rounded text-gray-300 hidden md:flex  items-center justify-center text-xs group-hover:flex">{containersCountValue}</div>
                    {/if}
                </li>
                <li on:click="{() => jumpToImages()}" class="flex w-full justify-between {meta.url === "/images" ? 'text-white' : 'text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
                    <a href="/images" class="flex items-center">
                        <svg class="icon icon-tabler icon-tabler-puzzle" width="18" height="18" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>

                        <span class="text-sm ml-2 hidden md:block group-hover:block">Images</span>
                    </a>
                    {#if $imagesInfos.length > 0}
                    <div class="py-1 px-3 bg-gray-600 rounded text-gray-300 hidden md:flex  items-center justify-center text-xs group-hover:flex">{$imagesInfos.length}</div>
                    {/if}
                
                </li>
                <li class="flex w-full justify-between {meta.url === "/providers" ? 'text-white' : 'text-gray-400'} hover:text-gray-300  cursor-pointer items-center mb-6">
                    <a href="/providers" class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-compass" width="18" height="18" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z"></path>
                            <polyline points="8 16 10 10 16 8 14 14 8 16"></polyline>
                            <circle cx="12" cy="12" r="9"></circle>
                        </svg>
                        <span class="text-sm ml-2 hidden md:block">Providers</span>
                    </a>
                </li>
                <li class="flex w-full justify-between {meta.url === "/extensions" ? 'text-white' : 'text-gray-400'} hover:text-gray-300  cursor-pointer items-center mb-6">
                  <a href="/extensions" class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-puzzle" width="18" height="18" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z"></path>
                          <path d="M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1"></path>
                      </svg>
                      <span class="text-sm ml-2 hidden md:block group-hover:block">Extensions</span>
                  </a>
              </li>

            </ul>
    </div>
-->
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


<!-- This is an example component 
<div class="min-h-screen bg-white border-2 border-gray-700">
  <nav class="flex flex-col w-64 bg-gray-50">
      <div class="p-4">
          <img src="https://tailwindcomponents.com/svg/logo-color.svg" />
      </div>
      <ul class="p-2 space-y-2 flex-1 overflow-auto" style="scrollbar-width: thin;">
          <li>
              <a href="#" class="flex space-x-2 items-center text-gray-600 p-2 bg-gray-200 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M20 7.093v-5.093h-3v2.093l3 3zm4 5.907l-12-12-12 12h3v10h7v-5h4v5h7v-10h3zm-5 8h-3v-5h-8v5h-3v-10.26l7-6.912 7 6.99v10.182z"/></svg>
                  <span class="text-gray-900 hidden lg:block">Containers</span>
              </a>
          </li>
          <li>
              <a href="#" class="flex space-x-2 items-center text-gray-600 p-2 hover:bg-gray-200 rounded-lg hover:text-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M17.997 18h-.998c0-1.552.06-1.775-.88-1.993-1.438-.332-2.797-.645-3.293-1.729-.18-.396-.301-1.048.155-1.907 1.021-1.929 1.277-3.583.702-4.538-.672-1.115-2.707-1.12-3.385.017-.576.968-.316 2.613.713 4.512.465.856.348 1.51.168 1.908-.49 1.089-1.836 1.4-3.262 1.728-.982.227-.92.435-.92 2.002h-.995l-.002-.623c0-1.259.1-1.985 1.588-2.329 1.682-.389 3.344-.736 2.545-2.209-2.366-4.365-.676-6.839 1.865-6.839 2.492 0 4.227 2.383 1.867 6.839-.775 1.464.824 1.812 2.545 2.209 1.49.344 1.589 1.072 1.589 2.333l-.002.619zm4.81-2.214c-1.289-.298-2.489-.559-1.908-1.657 1.77-3.342.47-5.129-1.4-5.129-1.265 0-2.248.817-2.248 2.325 0 1.269.574 2.175.904 2.925h1.048c-.17-.75-1.466-2.562-.766-3.736.412-.692 1.704-.693 2.114-.012.38.631.181 1.812-.534 3.161-.388.733-.28 1.301-.121 1.648.305.666.977.987 1.737 1.208 1.507.441 1.368.042 1.368 1.48h.997l.002-.463c0-.945-.074-1.492-1.193-1.75zm-22.805 2.214h.997c0-1.438-.139-1.039 1.368-1.48.761-.221 1.433-.542 1.737-1.208.159-.348.267-.915-.121-1.648-.715-1.349-.914-2.53-.534-3.161.41-.682 1.702-.681 2.114.012.7 1.175-.596 2.986-.766 3.736h1.048c.33-.75.904-1.656.904-2.925.001-1.509-.982-2.326-2.247-2.326-1.87 0-3.17 1.787-1.4 5.129.581 1.099-.619 1.359-1.908 1.657-1.12.258-1.194.805-1.194 1.751l.002.463z"/></svg>
                  <span>Teams</span>
              </a>
          </li>
          <li>
              <a href="#" class="flex space-x-2 items-center text-gray-600 p-2 hover:bg-gray-200 rounded-lg hover:text-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M10 15v-10h-5.033c-2.743 0-4.967 2.239-4.967 5 0 2.762 2.224 5 4.967 5h5.033zm-8-5c0-1.654 1.331-3 2.967-3h3.033v6h-3.033c-1.636 0-2.967-1.346-2.967-3zm22-10v20c-4.839-3.008-8.836-4.491-12-5v-2.014c3.042.438 6.393 1.624 10 3.548v-13.064c-3.622 1.941-6.912 3.099-10 3.544v-2.014c3.124-.498 7.036-1.915 12-5zm-11.993 22.475c-.52-.424-.902-.994-1.095-1.637l-1.151-3.827h-6.146l1.905 5.883c.214.659.828 1.106 1.522 1.106h4.46c.358 0 .677-.225.797-.562.12-.337.015-.713-.263-.939l-.029-.024zm-4.674-.475l-.982-3h1.933l.927 3h-1.878z"/></svg>
                  <span>Announcements</span>
              </a>
          </li>

          <li>
              <a href="#" class="flex space-x-2 items-center text-gray-600 p-2 hover:bg-gray-200 rounded-lg hover:text-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M17.997 18h-.998c0-1.552.06-1.775-.88-1.993-1.438-.332-2.797-.645-3.293-1.729-.18-.396-.301-1.048.155-1.907 1.021-1.929 1.277-3.583.702-4.538-.672-1.115-2.707-1.12-3.385.017-.576.968-.316 2.613.713 4.512.465.856.348 1.51.168 1.908-.49 1.089-1.836 1.4-3.262 1.728-.982.227-.92.435-.92 2.002h-.995l-.002-.623c0-1.259.1-1.985 1.588-2.329 1.682-.389 3.344-.736 2.545-2.209-2.366-4.365-.676-6.839 1.865-6.839 2.492 0 4.227 2.383 1.867 6.839-.775 1.464.824 1.812 2.545 2.209 1.49.344 1.589 1.072 1.589 2.333l-.002.619zm4.81-2.214c-1.289-.298-2.489-.559-1.908-1.657 1.77-3.342.47-5.129-1.4-5.129-1.265 0-2.248.817-2.248 2.325 0 1.269.574 2.175.904 2.925h1.048c-.17-.75-1.466-2.562-.766-3.736.412-.692 1.704-.693 2.114-.012.38.631.181 1.812-.534 3.161-.388.733-.28 1.301-.121 1.648.305.666.977.987 1.737 1.208 1.507.441 1.368.042 1.368 1.48h.997l.002-.463c0-.945-.074-1.492-1.193-1.75zm-22.805 2.214h.997c0-1.438-.139-1.039 1.368-1.48.761-.221 1.433-.542 1.737-1.208.159-.348.267-.915-.121-1.648-.715-1.349-.914-2.53-.534-3.161.41-.682 1.702-.681 2.114.012.7 1.175-.596 2.986-.766 3.736h1.048c.33-.75.904-1.656.904-2.925.001-1.509-.982-2.326-2.247-2.326-1.87 0-3.17 1.787-1.4 5.129.581 1.099-.619 1.359-1.908 1.657-1.12.258-1.194.805-1.194 1.751l.002.463z"/></svg>
                  <span>Teams</span>
              </a>
          </li>
          <li>
              <a href="#" class="flex space-x-2 items-center text-gray-600 p-2 hover:bg-gray-200 rounded-lg hover:text-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M10 15v-10h-5.033c-2.743 0-4.967 2.239-4.967 5 0 2.762 2.224 5 4.967 5h5.033zm-8-5c0-1.654 1.331-3 2.967-3h3.033v6h-3.033c-1.636 0-2.967-1.346-2.967-3zm22-10v20c-4.839-3.008-8.836-4.491-12-5v-2.014c3.042.438 6.393 1.624 10 3.548v-13.064c-3.622 1.941-6.912 3.099-10 3.544v-2.014c3.124-.498 7.036-1.915 12-5zm-11.993 22.475c-.52-.424-.902-.994-1.095-1.637l-1.151-3.827h-6.146l1.905 5.883c.214.659.828 1.106 1.522 1.106h4.46c.358 0 .677-.225.797-.562.12-.337.015-.713-.263-.939l-.029-.024zm-4.674-.475l-.982-3h1.933l.927 3h-1.878z"/></svg>
                  <span>Announcements</span>
              </a>
          </li>

      </ul>
      
      <div class="p-2 flex items-center border-t-2 border-gray-300 space-x-4">
          <div class="relative inline-flex">
              <span class="inline-flex bg-red-500 w-2 h-2 absolute right-0 bottom-0 rounded-full ring-2 ring-white transform translate-x-1/3 translate-y-1/3"></span>
              <img class='w-8 h-8 object-cover rounded-full' alt='User avatar' src='https://images.unsplash.com/photo-1477118476589-bff2c5c4cfbb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=200&q=200' />
          </div>
          <div>
              <h3 class="font-semibold tracking-wide text-gray-800">
                  Danimai
              </h3>
              <p class="text-sm text-gray-700">
                  view profile
              </p>
          </div>
      </div>
  </nav>
</div>
-->

 

</main>
</Route>
<!--
<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
    width: 16rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }
</style>
-->