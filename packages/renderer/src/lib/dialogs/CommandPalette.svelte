<script lang="ts">
import type {
  CommandInfo,
  CommandPaletteSearchOption,
  DocumentationInfo,
  GoToInfo,
  NavigationSearchEntryInfo,
} from '@desktop-framework/api';
import {
  faArrowUpRightFromSquare,
  faChevronRight,
  faFileLines,
  faFilePen,
  faMagnifyingGlass,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import { Button, type IconType, Input } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onMount, tick } from 'svelte';

import ArrowDownIcon from '/@/lib/images/ArrowDownIcon.svelte';
import ArrowUpIcon from '/@/lib/images/ArrowUpIcon.svelte';
import EnterIcon from '/@/lib/images/EnterIcon.svelte';
import NotFoundIcon from '/@/lib/images/NotFoundIcon.svelte';
import { isPropertyValidInContext } from '/@/lib/preferences/Util';
import { handleNavigation, resolveRoute } from '/@/navigation';
import { commandsInfos } from '/@/stores/commands';
import { context } from '/@/stores/context';
import { navigationRegistry, type NavigationRegistryEntry } from '/@/stores/navigation/navigation-registry';
import { navigationSearchEntries } from '/@/stores/navigation-search-entries';

import TextHighLight from './TextHighLight.svelte';

const ENTER_KEY = 'Enter';
const ESCAPE_KEY = 'Escape';
const ARROW_DOWN_KEY = 'ArrowDown';
const ARROW_UP_KEY = 'ArrowUp';
const TAB_KEY = 'Tab';
const F1 = 'F1';

interface Props {
  display?: boolean;
  onclose?: () => void;
}

type CommandPaletteItem = CommandInfo | DocumentationInfo | GoToInfo | NavigationSearchEntryInfo;

let { display = false, onclose }: Props = $props();

let outerDiv: HTMLDivElement | undefined = $state(undefined);
let inputElement: HTMLInputElement | undefined = $state(undefined);
let inputValue: string | undefined = $state('');
let scrollElements: HTMLLIElement[] = $state([]);
let searchIcon = $derived.by(() => {
  if (searchOptionsSelectedIndex === 1) {
    // Commands
    return faChevronRight;
  } else {
    return faMagnifyingGlass;
  }
});

let searchOptions: CommandPaletteSearchOption[] = $state([]);
let isMac: boolean = $state(false);
let modifierC: string = $derived(isMac ? '⌘' : 'Ctrl+');
let modifierS: string = $derived(isMac ? '⇧' : 'Shift+');
let shortcuts = $derived([[`${modifierC}${modifierS}P`], [`${F1}`, '>'], [`${modifierC}K`], [`${modifierC}F`]]);
let searchOptionsWithShortcuts = $derived(
  searchOptions.map((searchOption, index) => {
    return { ...searchOption, shortCut: index < shortcuts.length ? shortcuts[index] : undefined };
  }),
);

let searchOptionsSelectedIndex: number = $state(0);

let documentationItems: DocumentationInfo[] = $state([]);
let navigationItems: NavigationRegistryEntry[] = $derived($navigationRegistry);

// Recursively extract all destinations from the navigation registry (entries can nest via `items`)
let goToItems: GoToInfo[] = $derived.by(() => {
  function extract(entry: NavigationRegistryEntry): GoToInfo[] {
    if (entry.hidden) {
      return [];
    }
    return [...(entry.destinations ?? []), ...(entry.items ?? []).flatMap(extract)];
  }
  return navigationItems.flatMap(extract);
});
let helperText = $derived(searchOptionsWithShortcuts[searchOptionsSelectedIndex]?.placeholder);

// Keep backward compatibility with existing variable name
let filteredCommandInfoItems: CommandInfo[] = $derived(
  $commandsInfos
    .filter(property => isPropertyValidInContext(property.enablement, $context))
    .filter(item => (inputValue ? item.title?.toLowerCase().includes(inputValue.toLowerCase()) : true)),
);

// Documentation items filtering (no enablement property needed)
let filteredDocumentationInfoItems: DocumentationInfo[] = $derived(
  documentationItems.filter(item =>
    inputValue
      ? item.name?.toLowerCase().includes(inputValue.toLowerCase()) ||
        item.description?.toLowerCase().includes(inputValue.toLowerCase()) ||
        item.category?.toLowerCase().includes(inputValue.toLowerCase())
      : true,
  ),
);

let filteredGoToItems = $derived(
  goToItems.filter(item => (inputValue ? item.name.toLowerCase().includes(inputValue.toLowerCase()) : true)),
);

let filteredExtensionRouteItems: NavigationSearchEntryInfo[] = $derived(
  $navigationSearchEntries.filter(item =>
    inputValue ? item.label.toLowerCase().includes(inputValue.toLowerCase()) : true,
  ),
);

let filteredItems = $derived.by(() => {
  if (searchOptionsSelectedIndex === 1) {
    // Commands mode
    return filteredCommandInfoItems;
  } else if (searchOptionsSelectedIndex === 2) {
    // Documentation mode
    return filteredDocumentationInfoItems;
  } else if (searchOptionsSelectedIndex === 3) {
    // Go to mode
    return [...filteredGoToItems, ...filteredExtensionRouteItems];
  } else {
    // All mode - combine all
    return [
      ...filteredGoToItems,
      ...filteredExtensionRouteItems,
      ...filteredCommandInfoItems,
      ...filteredDocumentationInfoItems,
    ];
  }
});

onMount(async () => {
  const platform = await window.getOsPlatform();
  isMac = platform === 'darwin';
  documentationItems = await window.getDocumentationItems();
  searchOptions = await window.getCommandPaletteSearchOptions();
});

// Focus the input when the command palette becomes visible
$effect(() => {
  if (display && inputElement) {
    tick()
      .then(() => {
        inputElement?.focus();
      })
      .catch((error: unknown) => {
        console.error('Unable to focus input box', error);
      });
  }
});

let selectedFilteredIndex = $state(0);

function displaySearchBar(): void {
  // clear the input value
  inputValue = '';
  selectedFilteredIndex = 0;
  // toggle the display
  display = true;
  window.telemetryTrack('globalSearch.opened').catch(console.error);
}

async function handleKeydown(e: KeyboardEvent): Promise<void> {
  // open palette only if F1 key is pressed when palette is not already visible
  if (!display && e.key !== `${F1}`) {
    return;
  }

  // toggle display using F1 or ESC keys
  if (e.key === `${F1}` || e.key === '>') {
    selectedFilteredIndex = 0;
    searchOptionsSelectedIndex = 1;
    displaySearchBar();
    e.preventDefault();
    return;
  } else if (e.key === ESCAPE_KEY) {
    // here we toggle the display
    hideCommandPallete();
    e.preventDefault();
    return;
  } else if (e.ctrlKey || e.metaKey) {
    if (e.shiftKey && e.key.toLowerCase() === 'p') {
      searchOptionsSelectedIndex = 0;
      displaySearchBar();
      e.preventDefault();
    } else if (e.key.toLowerCase() === 'k') {
      searchOptionsSelectedIndex = 2;
      displaySearchBar();
      e.preventDefault();
    } else if (e.key.toLowerCase() === 'f') {
      searchOptionsSelectedIndex = 3;
      displaySearchBar();
      e.preventDefault();
    }
  }

  // no items, abort
  if (filteredItems.length === 0) {
    return;
  }

  if (e.key === ARROW_DOWN_KEY) {
    // if down key is pressed, move the index
    selectedFilteredIndex++;
    if (selectedFilteredIndex >= filteredItems.length) {
      selectedFilteredIndex = 0;
    }

    scrollElements[selectedFilteredIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    e.preventDefault();
  } else if (e.key === ARROW_UP_KEY) {
    // if up key is pressed, move the index
    selectedFilteredIndex--;
    if (selectedFilteredIndex < 0) {
      selectedFilteredIndex = filteredItems.length - 1;
    }
    scrollElements[selectedFilteredIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    e.preventDefault();
  } else if (e.key === ENTER_KEY) {
    // hide the command palette
    hideCommandPallete();

    await executeAction(selectedFilteredIndex);
    e.preventDefault();
  } else if (e.key === TAB_KEY) {
    switchSearchOption(e.shiftKey ? -1 : 1);
    e.preventDefault();
  }
}

function switchSearchOption(direction: 1 | -1): void {
  const searchOptionsLength = searchOptionsWithShortcuts.length;
  const offset = direction === 1 ? 0 : searchOptionsLength;
  searchOptionsSelectedIndex = (searchOptionsSelectedIndex + direction + offset) % searchOptionsLength;
}

async function executeAction(index: number): Promise<void> {
  const item = filteredItems[index];
  if (!item) return;

  let itemType: string;
  let pageLink: string | undefined = undefined;
  let commandHash: string | undefined = undefined;

  if (isDocItem(item)) {
    // Documentation item
    if (item.url) {
      try {
        await window.openExternal(item.url);
      } catch (error) {
        console.error('Error opening documentation URL', error);
      }
    }
    itemType = item.category;
    pageLink = item.url;
  } else if (isExtensionRouteItem(item)) {
    try {
      await window.navigateToRoute(item.routeId);
    } catch (error) {
      console.error('Error navigating to extension route', error);
    }
    itemType = 'ExtensionRoute';
  } else if (isGoToItem(item)) {
    handleNavigation(item);
    itemType = item.page;
  } else {
    // Command item
    if (item.id) {
      try {
        await window.executeCommand(item.id);
      } catch (error) {
        console.error('error executing command', error);
      }
    }
    itemType = 'Command';
    commandHash = await window.createHash(item.title ?? 'Unknown command');
  }

  const telemetryOptions = {
    // All / Commands / Docs / Go To
    selectedTab: searchOptionsWithShortcuts[searchOptionsSelectedIndex].text,
    // Pod or Image or Documentation or Command
    itemType: itemType,
    pageLink: pageLink,
    commandHash: commandHash,
  };

  await window.telemetryTrack('globalSearch.itemClicked', telemetryOptions);
}

function handleMousedown(e: MouseEvent): void {
  if (!display) {
    return;
  }

  if (outerDiv && !e.defaultPrevented && e.target instanceof Node && !outerDiv.contains(e.target)) {
    hideCommandPallete();
  }
}

function hideCommandPallete(): void {
  display = false;
  onclose?.();
}

async function clickOnItem(index: number): Promise<void> {
  // hide the command palette
  hideCommandPallete();

  // execute the action based on current mode
  selectedFilteredIndex = index;
  await executeAction(selectedFilteredIndex);
}

async function onInputChange(): Promise<void> {
  // in case of quick pick, filter the items
  selectedFilteredIndex = 0;
}

async function onAction(): Promise<void> {
  // When input is cleared, refocus it
  tick()
    .then(() => {
      inputElement?.focus();
    })
    .catch((error: unknown) => {
      console.error('Unable to focus input box', error);
    });
}

function isExtensionRouteItem(item: CommandPaletteItem): item is NavigationSearchEntryInfo {
  return 'routeId' in item;
}

function isGoToItem(item: CommandPaletteItem): item is GoToInfo {
  return 'page' in item;
}

function isDocItem(item: CommandPaletteItem): item is DocumentationInfo {
  return 'category' in item;
}

function getItemKey(item: CommandPaletteItem, index: number): string {
  if (isExtensionRouteItem(item)) {
    return `route:${item.routeId}`;
  }

  if (isGoToItem(item)) {
    return `goto:${resolveRoute(item)}`;
  }

  if (isDocItem(item)) {
    return `doc:${item.category}:${item.name}:${item.url ?? ''}:${index}`;
  }

  return `command:${item.id ?? ''}:${item.title ?? ''}:${index}`;
}

function getTextToHighlight(item: CommandPaletteItem): string {
  if (isExtensionRouteItem(item)) {
    return item.label;
  } else if (isDocItem(item)) {
    return `${item.category}: ${item.name}`;
  } else if (isGoToItem(item)) {
    return item.name;
  } else {
    return item.title ?? '';
  }
}

function getIcon(item: CommandPaletteItem): IconType {
  if (isExtensionRouteItem(item)) {
    return item.icon ?? faTerminal;
  } else if (isDocItem(item)) {
    return item.category === 'Tutorial' ? faFilePen : faFileLines;
  } else if (isGoToItem(item)) {
    if (item.icon) {
      return (item.icon.iconComponent ?? item.icon.faIcon ?? item.icon.iconImage ?? faTerminal) as IconType;
    }
  }
  return faTerminal;
}
</script>

<svelte:window on:keydown={handleKeydown} on:mousedown={handleMousedown} />

{#if display}
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-[var(--pd-modal-fade)] opacity-60 h-full z-50" style='-webkit-app-region: none;'></div>

  <div class="absolute m-auto left-0 right-0 z-50">
    <div class="flex justify-center items-center mt-1">
      <div
        bind:this={outerDiv}
        class="bg-[var(--pd-content-card-bg)] w-[700px] max-h-fit shadow-lg p-2 rounded-sm shadow-[var(--pd-input-field-stroke)] text-base">
        <div class="w-full flex flex-row gap-2 items-center">
          <Input
            aria-label='Command palette command input'
            bind:value={inputValue}
            bind:element={inputElement}
            clearable={true}
            on:input={onInputChange}
            on:action={onAction}
            placeholder={helperText}
            class="px-1 w-full text-[var(--pd-input-field-focused-text)] bg-[var(--pd-input-field-focused-bg)] border border-[var(--pd-input-field-stroke)] focus:outline-hidden" >
            {#snippet left()}
              <Icon icon={searchIcon} class="pr-1"/>
            {/snippet}
        </Input>
        </div>

        <div class="flex flex-row m-2">
          {#each searchOptionsWithShortcuts as searchOption, index (index)}
            <Button
              type="tab"
              class="focus:outline-hidden"
              on:click={(): void => {
                searchOptionsSelectedIndex = index;
              }}
              selected={searchOptionsSelectedIndex === index}>
              <div class="flex items-center gap-2">
                {#if searchOption.shortCut}
                  {#each searchOption.shortCut as shortCut, i (i)}
                    <div class='bg-[var(--pd-search-bar-nav-button)] rounded-sm px-0.5 shadow-sm shadow-b-1'>
                      {shortCut}
                    </div>
                  {/each}
                {/if}
                {searchOption.text}
              </div>
            </Button>
          {/each}
        </div>
        <ul class="max-h-[50vh] overflow-y-auto flex flex-col mt-1">
          {#each filteredItems as item, i (getItemKey(item, i))}
            {@const extensionRouteItem = isExtensionRouteItem(item)}
            {@const goToItem = isGoToItem(item)}
            {@const docItem = isDocItem(item)}
            {@const itemIcon = getIcon(item)}
            <li class="flex w-full flex-row" bind:this={scrollElements[i]} aria-label={extensionRouteItem ? item.label : goToItem ? item.name : (item.id)}>
              <button
                onclick={(): Promise<void> => clickOnItem(i)}
                class="text-[var(--pd-dropdown-item-text)] text-left relative w-full rounded-sm {i === selectedFilteredIndex
                  ? 'bg-[var(--pd-modal-dropdown-highlight)] selected'
                  : 'hover:bg-[var(--pd-dropdown-bg)]'}  px-1">
                <div class="flex flex-col w-full">
                  <div class="flex flex-row w-full max-w-[700px] truncate">
                    <div class="text-base py-[2pt] flex items-center gap-1">
                      <Icon class='w-[1.2em] h-[1.2em]' icon={itemIcon} />
                      <span>
                        <TextHighLight text={getTextToHighlight(item)} query={inputValue ?? ''} />
                      </span>
                      {#if docItem}
                        <Icon icon={faArrowUpRightFromSquare}/>
                      {/if}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          {/each}
        </ul>

        {#if filteredItems.length === 0}
          <div class='flex grow items-center flex-col gap-2 py-4'>
            <Icon icon={NotFoundIcon} />
            <div class='text-lg font-bold'>No results matching '{inputValue}' found</div>
            {#if searchOptionsSelectedIndex === 2}
              <div class='text-md'>Not what you expected? Double-check your spelling or try searching for:</div>
              <Button icon={faChevronRight} type='link' onclick={(): Promise<void> => window.openExternal('https://podman-desktop.io/docs')}>Browse All Documentation</Button>
            {/if}
          </div>
        {/if}

        <div class="border-[var(--pd-global-nav-bg-border)] border-t-[1px] flex flex-row items-center px-3 pt-2 gap-4 text-sm">
          <span class="flex items-center gap-2 text-[var(--pd-button-tab-text)] border-[var(--pd-button-tab-border-selected)]">
            <Icon icon={EnterIcon} class="bg-[var(--pd-action-button-bg)] rounded-sm p-1.5" size='2.2em'/>
            To select
          </span>
          <div class="flex items-center gap-2 text-[var(--pd-button-tab-text)] border-[var(--pd-button-tab-border-selected)]">
            <Icon icon={ArrowUpIcon} class="bg-[var(--pd-action-button-bg)] rounded-sm p-1.5" size='2.2em'/>
            <Icon icon={ArrowDownIcon} class="bg-[var(--pd-action-button-bg)] rounded-sm p-1.5" size='2.2em'/>
            To navigate
          </div>
          <div class="flex items-center gap-2 text-[var(--pd-button-tab-text)] border-[var(--pd-button-tab-border-selected)]">
            <div class='bg-[var(--pd-action-button-bg)] rounded-sm text-base px-1 py-0.5'>esc</div>
            To close
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
