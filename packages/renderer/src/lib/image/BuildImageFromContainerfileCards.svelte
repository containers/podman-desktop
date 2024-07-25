<script lang="ts">
import { faLinux } from '@fortawesome/free-brands-svg-icons';
import { faChevronCircleDown, faChevronRight, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';

import WebAssemblyIcon from '../images/WebAssemblyIcon.svelte';
import BuildImageFromContainerfileCard from './BuildImageFromContainerfileCard.svelte';

export let platforms: string = '';
let platformsArray: string[] = [];

interface CardInfo {
  title: string;
  badge: string;
  isDefault: boolean;
  checked: boolean;
  value: string;
  icon: unknown;
}

const DEFAULT_CARDS: CardInfo[] = [
  {
    title: 'Intel and AMD x86_64 systems',
    badge: 'AMD64',
    isDefault: false,
    checked: false,
    value: 'linux/amd64',
    icon: faLinux,
  },
  {
    title: 'ARM® aarch64 systems',
    badge: 'ARM64',
    isDefault: false,
    checked: false,
    value: 'linux/arm64',
    icon: faLinux,
  },
];

const ADVANCED_CARDS: CardInfo[] = [
  {
    title: 'Power ppc64le systems',
    badge: 'PPC64LE',
    isDefault: false,
    checked: false,
    value: 'linux/ppc64le',
    icon: faLinux,
  },
  {
    title: 'IBM s390x zSystems',
    badge: 'S390X',
    isDefault: false,
    checked: false,
    value: 'linux/s390x',
    icon: faLinux,
  },
  {
    title: 'WebAssembly',
    badge: 'WASI',
    isDefault: false,
    checked: false,
    value: 'wasi/wasm',
    icon: WebAssemblyIcon,
  },
];

let showMoreOptions = false;

let sortedCards: CardInfo[] = [];
let advancedCards: CardInfo[] = [];

onMount(async () => {
  // need to sort the default cards by having the first card using the same arch than Podman Desktop

  // get current arch
  let arch = await window.getOsArch();
  if (arch === 'x64') {
    arch = 'amd64';
  }

  // sort the default cards using current arch as first
  DEFAULT_CARDS.sort((a, b) => {
    if (a.value.includes(arch)) {
      return -1;
    }
    if (b.value.includes(arch)) {
      return 1;
    }
    return 0;
  });
  sortedCards = DEFAULT_CARDS;

  // first item should be the default
  sortedCards[0].isDefault = true;
  sortedCards[0].checked = true;

  advancedCards = ADVANCED_CARDS;
});

function handleCard(card: { detail: { mode: 'add' | 'remove'; value: string } }) {
  if (card.detail.mode === 'add') {
    // add card.detail.value from the array platformsArray
    platformsArray.push(card.detail.value);
  } else if (card.detail.mode === 'remove') {
    // remove card.detail.value from the array platformsArray
    platformsArray = platformsArray.filter(item => item !== card.detail.value);
  }

  // platforms should be a comma separated string
  platforms = platformsArray.join(',');
}

function addCard(item: { value: string }) {
  // create a new card and make it checked
  const card = {
    title: item.value,
    badge: 'custom',
    isDefault: false,
    checked: true,
    value: item.value,
    icon: faLayerGroup,
  };
  advancedCards.push(card);
  advancedCards = advancedCards;
}
</script>

<div class="flex flex-col" role="region" aria-label="Build Platform Options">
  <div class="flex flex-row gap-x-4 gap-y-4 flex-wrap">
    {#each sortedCards as card}
      <BuildImageFromContainerfileCard
        title={card.title}
        isDefault={card.isDefault}
        checked={card.checked}
        badge={card.badge}
        value={card.value}
        icon={card.icon}
        on:card={item => handleCard(item)} />
    {/each}
  </div>

  {#if !showMoreOptions}
    <button
      aria-label="Show more options"
      class="pt-2 flex items-center cursor-pointer text-[var(--pd-content-text)]"
      on:click={() => (showMoreOptions = !showMoreOptions)}>
      <Fa icon={faChevronRight} class=" mr-2 " />
      More Options...
    </button>
  {:else}
    <div class="flex flex-col pt-4">
      <div class="flex flex-row gap-x-4 flex-wrap gap-y-4">
        {#each advancedCards as card}
          <BuildImageFromContainerfileCard
            title={card.title}
            isDefault={card.isDefault}
            checked={card.checked}
            badge={card.badge}
            value={card.value}
            icon={card.icon}
            on:card={item => handleCard(item)} />
        {/each}
        <BuildImageFromContainerfileCard
          title="New platform"
          isDefault={false}
          checked={false}
          badge=""
          value=""
          additionalItem={true}
          on:addcard={item => addCard(item.detail)} />
      </div>
    </div>
    <button
      aria-label="Show less options"
      class="pt-2 flex items-center cursor-pointer text-[var(--pd-content-text)]"
      on:click={() => (showMoreOptions = !showMoreOptions)}>
      <Fa icon={faChevronCircleDown} class=" mr-2 transform rotate-90" />
      Less Options...
    </button>
  {/if}
</div>
