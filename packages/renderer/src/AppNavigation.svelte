<script lang="ts">
import { imagesInfos } from './stores/images';
import { contributions } from './stores/contribs';
import { podsInfos } from './stores/pods';
import { onDestroy, onMount } from 'svelte';
import { CommandRegistry } from './lib/CommandRegistry';
import { containersInfos } from './stores/containers';
import { volumeListInfos } from './stores/volumes';
import { ImageUtils } from './lib/image/image-utils';
import type { ImageInfo } from '../../main/src/plugin/api/image-info';
import type { ImageInfoUI } from './lib/image/ImageInfoUI';
import ContainerIcon from './lib/images/ContainerIcon.svelte';
import PodIcon from './lib/images/PodIcon.svelte';
import ImageIcon from './lib/images/ImageIcon.svelte';
import VolumeIcon from './lib/images/VolumeIcon.svelte';

let containersCountValue;
let imageInfoSubscribe;
let images: ImageInfoUI[] = [];

const imageUtils = new ImageUtils();

onMount(async () => {
  const commandRegistry = new CommandRegistry();
  commandRegistry.init();
  containersInfos.subscribe(value => {
    containersCountValue = value.length;
  });
  imageInfoSubscribe = imagesInfos.subscribe(value => {
    images = value.map((imageInfo: ImageInfo) => imageUtils.getImagesInfoUI(imageInfo, [])).flat();
  });
});

onDestroy(() => {
  if (imageInfoSubscribe) {
    imageInfoSubscribe();
  }
});

let contributionsExpanded: boolean = false;
function toggleContributions() {
  contributionsExpanded = !contributionsExpanded;
}

let innerWidth = 0;

export let meta;
</script>

<svelte:window bind:innerWidth="{innerWidth}" />
<nav
  class="pf-c-nav z-0 group w-14 hover:w-[250px] md:w-[250px] hover:sm:w-[250px] md:min-w-[200px] shadow flex-col justify-between sm:flex transition-all duration-500 ease-in-out overflow-hidden hover:overflow-y-auto"
  aria-label="Global">
  <ul class="pf-c-nav__list">
    <li
      class="pf-c-nav__item flex w-full justify-between {meta.url === '/'
        ? 'pf-m-current'
        : ''} hover:text-gray-300 cursor-pointer items-center mb-6">
      <a href="/" class="pf-c-nav__link flex items-center align-middle">
        <div class="flex items-center">
          <svg
            id="dashboard"
            width="24"
            height="24"
            viewBox="0.856 0.885 4.454 4.454"
            version="1.1"
            xml:space="preserve"
            xmlns="http://www.w3.org/2000/svg"
            ><defs></defs><g transform="translate(28.70309,-15.045389)"
              ><g transform="translate(15.017747,-0.13247817)"
                ><path
                  style="color:#000000;fill:#ffffff;stroke-linecap:round;stroke-linejoin:round"
                  d="m -42.621239,16.087895 c -0.06152,0 -0.120094,0.01566 -0.170016,0.05064 -0.04992,0.03498 -0.09353,0.09781 -0.09353,0.17415 v 0.77928 c 0,0.07634 0.04361,0.138649 0.09353,0.173633 0.04992,0.03498 0.108493,0.05064 0.170016,0.05064 h 3.967199 c 0.06152,0 0.118027,-0.01566 0.167949,-0.05064 0.04992,-0.03498 0.0956,-0.09729 0.0956,-0.173633 v -0.77928 c 0,-0.07634 -0.04568,-0.139166 -0.0956,-0.17415 -0.04992,-0.03498 -0.106426,-0.05064 -0.167949,-0.05064 z m 0,0.26355 h 3.967199 v 0.699182 h -3.967199 z m -0.112138,1.324467 c -0.05186,0.0038 -0.08726,0.03464 -0.104387,0.05633 -0.01826,0.02313 -0.02553,0.04299 -0.03152,0.06098 -0.01197,0.03597 -0.0155,0.06948 -0.0155,0.106971 v 0.77773 c 0,0.03749 0.0036,0.07153 0.0155,0.107487 0.006,0.01798 0.01326,0.03732 0.03152,0.06046 0.01826,0.02313 0.05762,0.0584 0.115239,0.0584 H -41.797 c 0.05761,0 0.09697,-0.03527 0.115238,-0.0584 0.01826,-0.02313 0.02554,-0.04247 0.03152,-0.06046 0.01197,-0.03597 0.0155,-0.07 0.0155,-0.107487 v -0.77773 c 0,-0.03749 -0.0036,-0.07101 -0.0155,-0.106971 -0.006,-0.01798 -0.01326,-0.03784 -0.03152,-0.06098 -0.01826,-0.02313 -0.05762,-0.05633 -0.115238,-0.05633 h -0.925525 c -0.0036,0 -0.0074,-2.51e-4 -0.01085,0 z m 1.623156,0 c -0.05207,0.0038 -0.08934,0.03464 -0.106453,0.05633 -0.01826,0.02313 -0.02553,0.04299 -0.03152,0.06098 -0.01197,0.03597 -0.0155,0.06948 -0.0155,0.106971 v 0.77773 c 0,0.03749 0.0036,0.07153 0.0155,0.107487 0.006,0.01798 0.01326,0.03732 0.03152,0.06046 0.01826,0.02313 0.05969,0.0584 0.117305,0.0584 h 0.923458 c 0.05761,0 0.09698,-0.03527 0.115239,-0.0584 0.01826,-0.02313 0.02709,-0.04247 0.03307,-0.06046 0.01197,-0.03597 0.01602,-0.07 0.01602,-0.107487 v -0.77773 c 0,-0.03749 -0.0041,-0.07101 -0.01602,-0.106971 -0.006,-0.01798 -0.01481,-0.03784 -0.03307,-0.06098 -0.01826,-0.02313 -0.05763,-0.05633 -0.115239,-0.05633 h -0.923458 c -0.0036,0 -0.0074,-2.51e-4 -0.01085,0 z m 1.62109,0 c -0.05186,0.0038 -0.08726,0.03464 -0.104386,0.05633 -0.01826,0.02313 -0.02554,0.04299 -0.03152,0.06098 -0.01197,0.03597 -0.01757,0.06948 -0.01757,0.106971 v 0.77773 c 0,0.03749 0.0056,0.07153 0.01757,0.107487 0.006,0.01798 0.01326,0.03732 0.03152,0.06046 0.01826,0.02313 0.05762,0.0584 0.115238,0.0584 h 0.923458 c 0.05761,0 0.09905,-0.03527 0.117306,-0.0584 0.01826,-0.02313 0.02554,-0.04247 0.03152,-0.06046 0.01197,-0.03597 0.0155,-0.07 0.0155,-0.107487 v -0.77773 c 0,-0.03749 -0.0036,-0.07101 -0.0155,-0.106971 -0.006,-0.01798 -0.01326,-0.03784 -0.03152,-0.06098 -0.01826,-0.02313 -0.05969,-0.05633 -0.117306,-0.05633 h -0.923458 c -0.0036,0 -0.0074,-2.51e-4 -0.01085,0 z m -3.132108,0.26355 h 0.722953 v 0.699182 h -0.722953 z m 1.623156,0 h 0.720887 v 0.699182 h -0.720887 z m 1.62109,0 h 0.722953 v 0.699182 h -0.722953 z m -3.304708,1.324467 c -0.118917,0.0065 -0.203088,0.112408 -0.203088,0.224275 v 0.777214 c 0,0.115477 0.08997,0.224792 0.214974,0.224792 h 2.509407 c 0.125004,0 0.217041,-0.109315 0.217041,-0.224792 v -0.777214 c 0,-0.115475 -0.09203,-0.224275 -0.217041,-0.224275 h -2.509407 c -0.0039,0 -0.008,-2.1e-4 -0.01189,0 z m 3.19257,0 c -0.05186,0.0038 -0.08726,0.03464 -0.104386,0.05633 -0.01826,0.02313 -0.02554,0.04247 -0.03152,0.06046 -0.01197,0.03597 -0.01757,0.06999 -0.01757,0.107487 v 0.777214 c 0,0.03749 0.0056,0.07151 0.01757,0.107487 0.006,0.01798 0.01326,0.03732 0.03152,0.06046 0.01826,0.02313 0.05762,0.05684 0.115238,0.05684 h 0.923458 c 0.05761,0 0.09905,-0.03371 0.117306,-0.05684 0.01826,-0.02313 0.02554,-0.04247 0.03152,-0.06046 0.01197,-0.03597 0.0155,-0.06999 0.0155,-0.107487 v -0.777214 c 0,-0.03749 -0.0036,-0.07151 -0.0155,-0.107487 -0.006,-0.01798 -0.01326,-0.03732 -0.03152,-0.06046 -0.01826,-0.02313 -0.05969,-0.05633 -0.117306,-0.05633 h -0.923458 c -0.0036,0 -0.0074,-2.51e-4 -0.01085,0 z m -3.132108,0.263549 h 2.412255 v 0.699183 h -2.412255 z m 3.244246,0 h 0.722953 v 0.699183 h -0.722953 z"
                ></path
                ></g
              ></g
            ></svg>
          <span
            class="opacity-0 -z-40 md:z-0 group-hover:z-0 md:opacity-100 group-hover:opacity-100 group-hover:delay-150 group-hover:duration-75 group-hover:ease-in-out mx-3 md:transition-opacity md:delay-150 md:duration-150 md:ease-in-out"
            >Dashboard</span>
        </div>
      </a>
    </li>

    <li
      class="pf-c-nav__item flex w-full justify-between {meta.url.startsWith('/containers')
        ? 'pf-m-current'
        : ''} hover:text-gray-300 cursor-pointer items-center mb-6">
      <a href="/containers" class="pf-c-nav__link flex items-center align-middle">
        <div class="flex items-center w-full h-full">
          <div class="flex items-center">
            <ContainerIcon size="24" />
            <span
              class="opacity-0 -z-40 md:z-0 group-hover:z-0 md:opacity-100 group-hover:opacity-100 group-hover:delay-150 group-hover:duration-75 group-hover:ease-in-out ml-3 md:transition-opacity md:delay-150 md:duration-150 md:ease-in-out"
              >Containers</span>
          </div>

          <div class="flex w-full justify-end">
            <div>
              {#if containersCountValue > 0}
                {#if innerWidth >= 768}
                  <span class="pf-c-badge pf-m-read hidden items-center justify-center">{containersCountValue}</span>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      </a>
    </li>
    <li
      class="pf-c-nav__item flex w-full justify-between {meta.url === '/pods'
        ? 'dark:text-white pf-m-current'
        : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
      <a href="/pods" class="pf-c-nav__link">
        <div class="flex items-center w-full h-full">
          <div class="flex items-center">
            <PodIcon size="24" />
            <span
              class="opacity-0 -z-40 md:z-0 group-hover:z-0 md:opacity-100 group-hover:opacity-100 group-hover:delay-150 group-hover:duration-75 group-hover:ease-in-out ml-3 md:transition-opacity md:delay-150 md:duration-150 md:ease-in-out"
              >Pods</span>
          </div>
          <div class="flex w-full justify-end">
            <div>
              {#if innerWidth >= 768}
                {#if $podsInfos.length > 0}
                  <span class="pf-c-badge pf-m-read hidden items-center justify-center">{$podsInfos.length}</span>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      </a>
    </li>
    <li
      class="pf-c-nav__item flex w-full justify-between {meta.url === '/images'
        ? 'dark:text-white pf-m-current'
        : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
      <a href="/images" class="pf-c-nav__link">
        <div class="flex items-center w-full h-full">
          <div class="flex items-center">
            <ImageIcon size="24" />
            <span
              class="opacity-0 -z-40 md:z-0 group-hover:z-0 md:opacity-100 group-hover:opacity-100 group-hover:delay-150 group-hover:duration-75 group-hover:ease-in-out ml-3 md:transition-opacity md:delay-150 md:duration-150 md:ease-in-out"
              >Images</span>
          </div>
          <div class="flex w-full justify-end">
            <div>
              {#if innerWidth >= 768}
                {#if $imagesInfos.length > 0}
                  <span class="pf-c-badge pf-m-read hidden items-center justify-center">{images.length}</span>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      </a>
    </li>
    <li
      class="pf-c-nav__item flex w-full justify-between {meta.url === '/volumes'
        ? 'dark:text-white pf-m-current'
        : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
      <a href="/volumes" class="pf-c-nav__link">
        <div class="flex items-center w-full h-full">
          <div class="flex items-center">
            <VolumeIcon size="24" />
            <span
              class="opacity-0 -z-40 md:z-0 group-hover:z-0 md:opacity-100 group-hover:opacity-100 group-hover:delay-150 group-hover:duration-75 group-hover:ease-in-out ml-3 md:transition-opacity md:delay-150 md:duration-150 md:ease-in-out"
              >Volumes</span>
          </div>
          <div class="flex w-full justify-end">
            <div>
              {#if innerWidth >= 768}
                {@const flattenedVolumes = $volumeListInfos.map(volumeInfo => volumeInfo.Volumes).flat()}
                {#if flattenedVolumes.length > 0}
                  <span class="pf-c-badge pf-m-read hidden items-center justify-center">{flattenedVolumes.length}</span>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      </a>
    </li>
    {#if $contributions.length > 0}
      <li class="pf-c-nav__item pf-m-expandable {contributionsExpanded ? '' : 'pf-m-expanded'}">
        <div class="pf-c-nav__link cursor-pointer" aria-expanded="true" on:click="{() => toggleContributions()}">
          <div class="flex items-center">
            <svg
              id="extensions"
              width="24"
              height="24"
              version="1.1"
              viewBox="1.158 0.784 4.408 4.408"
              xml:space="preserve"
              xmlns="http://www.w3.org/2000/svg"
              ><g transform="translate(-14.802 -15.079)"
                ><path
                  d="m17.906 15.863c-0.16971 0-0.32767 0.05096-0.44727 0.14062-0.11959 0.08966-0.20312 0.22586-0.20312 0.38086 0 0.15539 0.08551 0.29117 0.20508 0.38086 0.03655 0.02717 0.05273 0.05925 0.05273 0.07813 0 0.03194-0.02275 0.05469-0.05469 0.05469h-0.97852c-0.28604 0-0.51953 0.23545-0.51953 0.52148v0.45898c-1e-6 0.17526 0.14311 0.32031 0.31836 0.32031 0.13007 0 0.22915-0.07693 0.29102-0.16016 0.05114-0.06819 0.11002-0.09766 0.16992-0.09766 0.05948 0 0.11701 0.02968 0.16797 0.09766 0.05096 0.06797 0.08789 0.17112 0.08789 0.28711s-0.03693 0.21914-0.08789 0.28711c-0.05096 0.06797-0.10849 0.09961-0.16797 0.09961-0.0599 0-0.11877-0.03141-0.16992-0.09961-0.06186-0.08324-0.16095-0.16016-0.29102-0.16016-0.17526 0-0.31836 0.14506-0.31836 0.32031v0.97656c-1e-6 0.28603 0.2335 0.52148 0.51953 0.52148h0.97852c0.17526 0 0.32031-0.14506 0.32031-0.32031 0-0.13007-0.07693-0.22915-0.16016-0.29102-0.06819-0.05114-0.09961-0.10807-0.09961-0.16797 0-0.05948 0.03164-0.11896 0.09961-0.16992 0.06797-0.05096 0.17112-0.08594 0.28711-0.08594s0.21718 0.03497 0.28516 0.08594c0.06797 0.05096 0.09961 0.11044 0.09961 0.16992 0 0.0599-0.03141 0.11681-0.09961 0.16797-0.08324 0.06187-0.16016 0.16096-0.16016 0.29102 0 0.17526 0.14506 0.32031 0.32031 0.32031h0.46094c0.28604 0 0.51953-0.23545 0.51953-0.52148v-0.97656c0-0.03195 0.0247-0.05664 0.05664-0.05664 0.01886 0 0.05095 0.01813 0.07813 0.05469 0.08969 0.11959 0.22548 0.20508 0.38086 0.20508 0.155 0 0.2912-0.08548 0.38086-0.20508 0.08966-0.11959 0.14062-0.2756 0.14062-0.44531s-0.05096-0.32572-0.14062-0.44531c-0.08966-0.1196-0.22586-0.20508-0.38086-0.20508-0.15539 0-0.29118 0.08552-0.38086 0.20508-0.02716 0.03655-0.05925 0.05469-0.07813 0.05469-0.03194 0-0.05664-0.0247-0.05664-0.05664v-0.45898c0-0.28603-0.2335-0.52148-0.51953-0.52148h-0.46094c-0.03195 0-0.05469-0.02275-0.05469-0.05469 0-0.01886 0.01618-0.05095 0.05273-0.07813h2e-3c0.11959-0.08969 0.20508-0.22548 0.20508-0.38086 0-0.155-0.08548-0.2912-0.20508-0.38086-0.11959-0.08966-0.2756-0.14062-0.44531-0.14062zm0 0.26367c0.11599 0 0.21718 0.03693 0.28516 0.08789 0.06797 0.05096 0.09961 0.11044 0.09961 0.16992 0 0.0599-0.03142 0.11683-0.09961 0.16797-0.08322 0.06186-0.16016 0.16095-0.16016 0.29102 0 0.17525 0.14505 0.32031 0.32031 0.32031h0.46094c0.14293 0 0.25586 0.11293 0.25586 0.25586v0.45898c0 0.17525 0.14505 0.32031 0.32031 0.32031 0.12939 0 0.22714-0.0774 0.28906-0.16016 0.05116-0.0682 0.11003-0.09766 0.16992-0.09766 0.05948 0 0.11896 0.02968 0.16992 0.09766 0.05096 0.06797 0.08594 0.17112 0.08594 0.28711s-0.03498 0.21914-0.08594 0.28711c-0.05096 0.06797-0.11044 0.09961-0.16992 0.09961-0.05938 0-0.11714-0.03263-0.16797-0.09961h-2e-3c-0.06192-0.08273-0.15966-0.16016-0.28906-0.16016-0.17525 0-0.32031 0.14505-0.32031 0.32031v0.97656c0 0.14293-0.11293 0.25781-0.25586 0.25781h-0.46094c-0.03194 0-0.05469-0.0247-0.05469-0.05664 0-0.01888 0.01618-0.05096 0.05273-0.07813h2e-3c0.11956-0.08968 0.20508-0.22546 0.20508-0.38086 0-0.155-0.08548-0.2912-0.20508-0.38086-0.11959-0.08966-0.2756-0.14062-0.44531-0.14062s-0.32767 0.05096-0.44727 0.14062c-0.11959 0.08966-0.20312 0.22586-0.20312 0.38086 0 0.15538 0.08549 0.29117 0.20508 0.38086 0.03656 0.02718 0.05273 0.05927 0.05273 0.07813 0 0.03194-0.02274 0.05664-0.05469 0.05664h-0.97852c-0.14293 0-0.25586-0.11489-0.25586-0.25781v-0.97656c0-0.03194 0.02274-0.05664 0.05469-0.05664 0.01888 0 0.05291 0.01813 0.08008 0.05469 0.08968 0.11956 0.22547 0.20508 0.38086 0.20508 0.155 0 0.2912-0.08548 0.38086-0.20508 0.08966-0.11959 0.13867-0.2756 0.13867-0.44531s-0.04901-0.32572-0.13867-0.44531c-0.08966-0.1196-0.22586-0.20508-0.38086-0.20508-0.15538 0-0.29117 0.08549-0.38086 0.20508-0.02718 0.03656-0.06122 0.05469-0.08008 0.05469-0.03194 0-0.05469-0.0247-0.05469-0.05664v-0.45898c0-0.14292 0.11293-0.25586 0.25586-0.25586h0.97852c0.17525 0 0.32031-0.14505 0.32031-0.32031 0-0.13006-0.07691-0.22915-0.16016-0.29102-0.0682-0.05115-0.09961-0.10807-0.09961-0.16797 0-0.05948 0.03164-0.11896 0.09961-0.16992 0.06797-0.05096 0.17112-0.08789 0.28711-0.08789z"
                  color="#000000"
                  fill="#fff"
                  style="-inkscape-stroke:none"></path
                ></g
              ></svg>
            <span
              class="opacity-0 -z-40 md:z-0 group-hover:z-0 md:opacity-100 group-hover:opacity-100 group-hover:delay-150 group-hover:duration-75 group-hover:ease-in-out ml-3 md:transition-opacity md:delay-150 md:duration-150 md:ease-in-out"
              >Extensions</span>
            <span class="pf-c-nav__toggle">
              <span
                class="pf-c-nav__toggle-icon opacity-0 -z-40 md:z-0 group-hover:z-0 md:opacity-100 group-hover:opacity-100 group-hover:delay-150 group-hover:duration-75 group-hover:ease-in-out md:transition-opacity md:delay-150 md:duration-150 md:ease-in-out">
                <i class="fas fa-angle-right" aria-hidden="true"></i>
              </span>
            </span>
          </div>
        </div>
        <section class="pf-c-nav__subnav {contributionsExpanded ? 'hidden' : 'flex'}">
          <ul class="pf-c-nav__list w-full">
            {#each $contributions as contribution}
              <li class="pf-c-nav__item">
                <a href="/contribs/{contribution.name}" class="pf-c-nav__link">
                  <div class="flex items-center w-full sm:-ml-1.5 md:-ml-1.5 mr-2">
                    <img src="{contribution.icon}" width="24" height="24" class="mr-4" alt="{contribution.name} icon" />
                    <span
                      class="w-full text-ellipsis whitespace-nowrap overflow-hidden opacity-0 -z-40 md:z-0 md:opacity-100 group-hover:z-0 group-hover:opacity-100 group-hover:delay-150 group-hover:duration-75 group-hover:ease-in-out md:transition-opacity md:delay-150 md:duration-150 md:ease-in-out"
                      title="{contribution.name}">{contribution.name}</span>
                  </div>
                </a>
              </li>
            {/each}
          </ul>
        </section>
      </li>
    {/if}
  </ul>

  <ul class="pf-c-nav__list">
    <li
      class="pf-c-nav__item flex w-full justify-between {meta.url.startsWith('/preferences')
        ? 'dark:text-white pf-m-current'
        : 'dark:text-gray-400'} hover:text-gray-300 cursor-pointer items-center mb-6">
      <a href="/preferences" class="pf-c-nav__link">
        <div class="flex items-center">
          <svg
            id="settings"
            width="24"
            height="24"
            viewBox="1.189 0.928 4.494 4.494"
            version="1.1"
            xml:space="preserve"
            xmlns="http://www.w3.org/2000/svg"
            ><defs id="defs2"></defs><g id="layer1" transform="translate(-7.6660583,-15.073749)"
              ><g
                style="fill:none;-webkit-print-color-adjust:exact"
                id="g707"
                transform="matrix(0.26458333,0,0,0.26458333,-387.48921,-194.74083)"
                ><g id="shape-79d97bd7-4979-11ed-9e28-8943899c0994"
                  ><g id="fills-79d97bd7-4979-11ed-9e28-8943899c0994"
                    ><path
                      rx="0"
                      ry="0"
                      d="m 1512.957,802.206 c 0.103,0.269 0.016,0.572 -0.196,0.769 l -1.346,1.231 c 0.034,0.26 0.053,0.525 0.053,0.794 0,0.269 -0.019,0.534 -0.053,0.794 l 1.346,1.231 c 0.212,0.197 0.299,0.5 0.196,0.769 -0.137,0.372 -0.302,0.731 -0.488,1.072 l -0.146,0.253 c -0.205,0.344 -0.435,0.668 -0.687,0.978 -0.187,0.222 -0.488,0.3 -0.762,0.212 l -1.731,-0.556 c -0.416,0.322 -0.904,0.591 -1.368,0.797 l -0.388,1.784 c -0.062,0.282 -0.28,0.482 -0.566,0.557 -0.429,0.072 -0.87,0.109 -1.349,0.109 -0.422,0 -0.864,-0.037 -1.293,-0.109 -0.286,-0.075 -0.503,-0.275 -0.566,-0.557 l -0.388,-1.784 c -0.491,-0.206 -0.951,-0.475 -1.368,-0.797 l -1.73,0.556 c -0.275,0.088 -0.578,0.01 -0.762,-0.212 -0.252,-0.31 -0.482,-0.634 -0.687,-0.978 l -0.145,-0.253 c -0.189,-0.341 -0.353,-0.7 -0.491,-1.072 -0.1,-0.269 -0.016,-0.572 0.198,-0.769 l 1.344,-1.231 c -0.034,-0.26 -0.052,-0.525 -0.052,-0.794 0,-0.269 0.018,-0.534 0.052,-0.794 l -1.344,-1.231 c -0.214,-0.197 -0.298,-0.497 -0.198,-0.769 0.138,-0.372 0.302,-0.731 0.491,-1.072 l 0.145,-0.253 c 0.205,-0.344 0.435,-0.668 0.687,-0.976 0.184,-0.224 0.487,-0.301 0.762,-0.213 l 1.73,0.555 c 0.417,-0.323 0.877,-0.592 1.368,-0.796 l 0.388,-1.784 c 0.063,-0.284 0.28,-0.509 0.566,-0.557 0.429,-0.072 0.871,-0.11 1.321,-0.11 0.451,0 0.892,0.038 1.321,0.11 0.286,0.048 0.504,0.273 0.566,0.557 l 0.388,1.784 c 0.464,0.204 0.952,0.473 1.368,0.796 l 1.731,-0.555 c 0.274,-0.088 0.575,-0.011 0.762,0.213 0.252,0.308 0.482,0.632 0.687,0.976 l 0.146,0.253 c 0.186,0.341 0.351,0.7 0.488,1.072 z m 0,0 z m -7.457,5.294 c 1.374,0 2.487,-1.119 2.487,-2.528 0,-1.353 -1.113,-2.5 -2.487,-2.5 -1.374,0 -2.486,1.147 -2.486,2.5 0,1.409 1.112,2.528 2.486,2.528 z"
                      id="path687"></path
                    ></g
                  ><g id="strokes-79d97bd7-4979-11ed-9e28-8943899c0994"
                    ><g class="stroke-shape" id="g692"
                      ><path
                        style="color:#000000;fill:#ffffff;-inkscape-stroke:none"
                        d="m 1504.0957,796.61719 c -0.4968,0.0834 -0.8672,0.47493 -0.9707,0.9414 v 0.002 l -0.3437,1.57617 c -0.3436,0.16157 -0.6703,0.35084 -0.9786,0.56836 l -1.5234,-0.48828 v -0.002 c -0.4572,-0.14629 -0.9816,-0.0156 -1.3008,0.37305 -0.6338,0.73023 -1.0257,1.58362 -1.4023,2.44354 v 0.002 c -0.1724,0.46887 -0.024,0.9864 0.1521,1.14848 l 1.344,1.23043 c -0.067,0.40495 -0.02,0.7984 0,1.17578 l -1.345,1.2313 c -0.177,0.16293 -0.3238,0.6799 -0.1492,1.14956 v 0 c 0.3134,0.91226 0.8482,1.68714 1.4004,2.44354 v 0.002 0.002 c 0.3193,0.38533 0.8406,0.51577 1.2988,0.36914 l 1.5234,-0.49024 c 0.3086,0.21732 0.6348,0.40983 0.9786,0.57227 l 0.3964,1.81089 c 0.053,0.23667 0.4381,0.58239 0.875,0.69697 l 0.022,0.006 0.022,0.004 c 0.9592,0.18183 1.9141,0.0963 2.8086,0 l 0.022,-0.004 0.022,-0.006 c 0.4366,-0.11451 0.8236,-0.45995 0.9277,-0.93359 l 0.3418,-1.57422 c 0.3326,-0.16012 0.6624,-0.3515 0.9805,-0.57227 l 1.5234,0.49024 c 0.4574,0.1469 0.9767,0.0148 1.2969,-0.36524 v -0.004 -0.004 c 0.6337,-0.73004 1.0208,-1.57951 1.3946,-2.43968 v -0.002 c 0.1803,-0.47335 0.027,-0.98836 -0.1476,-1.15043 l -1.3465,-1.23238 c 0.07,-0.40529 0.02,-0.79787 0,-1.17578 l 1.3463,-1.23238 c 0.1744,-0.16207 0.3281,-0.67708 0.1478,-1.15043 -0.3081,-0.91475 -0.843,-1.68616 -1.3946,-2.44164 v -0.002 -0.002 c -0.32,-0.38335 -0.8424,-0.51375 -1.2988,-0.36718 l -1.5234,0.48828 c -0.3179,-0.22116 -0.6476,-0.41095 -0.9805,-0.57031 l -0.3418,-1.57422 c -0.1024,-0.46885 -0.4741,-0.86001 -0.9707,-0.94336 -0.9606,-0.18555 -1.876,-0.10246 -2.8067,2.3e-4 z m 2.6426,0.98633 c 0.075,0.0126 0.1385,0.0708 0.1601,0.16992 l 0.4414,2.0332 c 0.6563,0.25363 1.1745,0.62449 1.7051,0.99609 l 1.9824,-0.63476 c 0.091,-0.0292 0.1688,-0.007 0.2227,0.0566 4e-4,5.2e-4 0,-5.3e-4 0,0 0.5578,0.64154 0.9121,1.41026 1.2363,2.1543 v 0.002 0.004 c 0.025,0.0641 0,0.1552 -0.07,0.2246 l -1.5351,1.4043 c 0.1327,0.69037 0.068,1.30989 0,1.97266 l 1.5351,1.40429 c 0.075,0.0694 0.095,0.16051 0.07,0.22461 v 0.004 0.002 c -0.2704,0.80443 -0.761,1.50284 -1.2363,2.1543 -0.054,0.0628 -0.1348,0.0855 -0.2247,0.0566 l -1.9824,-0.63476 c -0.5385,0.45 -1.1226,0.71813 -1.7051,0.99804 l -0.4414,2.03125 c -0.019,0.0872 -0.072,0.14021 -0.1972,0.17578 -0.833,0.15451 -1.6222,0.0801 -2.4024,0 -0.1245,-0.0355 -0.1773,-0.0883 -0.1972,-0.17773 l -0.4434,-2.03516 c -0.6461,-0.23372 -1.2328,-0.67088 -1.7031,-0.99217 l -1.9805,0.63476 c -0.091,0.0291 -0.1738,0.003 -0.2226,-0.0547 v 0 c -0.5586,-0.64425 -0.9013,-1.40016 -1.2305,-2.15853 v 0 c -0.025,-0.0678 0,-0.15667 0.068,-0.22461 l 1.5352,-1.4082 c -0.1285,-0.69058 -0.066,-1.30922 0,-1.97266 l -1.5352,-1.4082 c -0.074,-0.0695 -0.094,-0.15203 -0.066,-0.22656 0.2754,-0.80599 0.744,-1.49203 1.2325,-2.15658 0.049,-0.0594 0.1298,-0.0844 0.2226,-0.0547 l 1.9805,0.63476 c 0.5424,-0.44753 1.1133,-0.70204 1.7031,-0.99022 l 0.4434,-2.03711 v -0.002 c 0.023,-0.10038 0.085,-0.15738 0.1601,-0.16992 0.8479,-0.16791 1.6536,-0.0852 2.4746,5.1e-4 z m -1.2383,4.36914 c -1.6523,0 -2.9863,1.37304 -2.9863,3 0,1.67207 1.3408,3.02734 2.9863,3.02734 1.6455,0 2.9863,-1.35504 2.9863,-3.02734 0,-1.62721 -1.334,-3 -2.9863,-3 z m 0,1 c 1.0957,0 1.9863,0.9212 1.9863,2 0,1.14569 -0.8838,2.02734 -1.9863,2.02734 -1.1025,0 -1.9863,-0.88142 -1.9863,-2.02734 0,-1.07904 0.8906,-2 1.9863,-2 z"
                        id="path690"></path
                      ></g
                    ></g
                  ></g
                ></g
              ></g>
          </svg>
          <span class="hidden md:block group-hover:block mx-3">Settings</span>
        </div>
      </a>
    </li>
  </ul>
</nav>
