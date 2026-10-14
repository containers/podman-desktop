<script lang="ts">
/* eslint-disable import/no-duplicates */
import type { ExtensionInfo } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { Dropdown } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onDestroy, onMount } from 'svelte';
import { get, type Unsubscriber, type Writable } from 'svelte/store';

import type { ContextUI } from '/@/lib/context/context';
import Markdown from '/@/lib/markdown/Markdown.svelte';
import { isPropertyValidInContext } from '/@/lib/preferences/Util';
/* eslint-enable import/no-duplicates */
import { configurationProperties } from '/@/stores/configurationProperties';
import { context } from '/@/stores/context';
import { extensionInfos } from '/@/stores/extensions';

const DOCKER_COMPAT_SCOPE = 'DockerCompatibility';

// svelte is not handling the store properly
// should be fixed in 5.1.2+ but there is still an issue
// https://github.com/sveltejs/svelte/pull/13887
//
let refreshValues = false;
const subscribers: Unsubscriber[] = [];
function wrapStore<T>(store: Writable<T>): T {
  let wrapped = get(store);
  subscribers.push(
    store.subscribe(v => {
      wrapped = v;
      if (refreshValues) {
        extractGroupItems();
      }
    }),
  );
  return wrapped;
}

const properties: IConfigurationPropertyRecordedSchema[] = $state($configurationProperties);
const extensions: ExtensionInfo[] = $state($extensionInfos);
const globalContext: ContextUI = $state(wrapStore(context));

onMount(() => {
  refreshValues = true;
});

onDestroy(() => {
  for (const subscriber of subscribers) {
    subscriber();
  }
});

interface EnumItem {
  label: string;
  value: string;
  selected: boolean;
}

interface PropertyWithDisplayName extends IConfigurationPropertyRecordedSchema {
  id: string;
  displayName: string;
  selectedValue?: string;
  enumItems?: EnumItem[];
}

interface GroupItem {
  name: string;
  icon?: string | { light: string; dark: string };
  properties: PropertyWithDisplayName[];
}

// a list of group items
const groupItems: { items: GroupItem[] } = $state({ items: [] });

$effect(() => {
  extractGroupItems();
});
function extractGroupItems(): void {
  const updatedGroupItems: GroupItem[] = [];

  // properties that are in the docker compatibility scope
  const dockerCompatProperties = properties
    .filter(property =>
      Array.isArray(property.scope)
        ? property.scope.find(s => s === DOCKER_COMPAT_SCOPE)
        : property.scope === DOCKER_COMPAT_SCOPE,
    )
    .filter(property => isPropertyValidInContext(property.when, globalContext));

  // filter out properties that are not in running extensions
  const propertiesFromRunningExtensions = dockerCompatProperties.filter(property => {
    return extensions.find(ext => ext.id === property.extension?.id && ext.state === 'started');
  });

  for (const property of propertiesFromRunningExtensions) {
    // keep the value having a group
    if (property.markdownDescription && property.group) {
      const name = property.group;
      let icon: string | { light: string; dark: string } | undefined;
      // do we have a group item for this property ?
      let groupItem = updatedGroupItems.find(item => item.name === name);
      if (!groupItem) {
        // get icon
        const foundExtension = extensions.find(ext => ext.id === property.group);
        if (foundExtension) {
          icon = foundExtension.icon;
        }
        groupItem = {
          name,
          icon,
          properties: [],
        };
        updatedGroupItems.push(groupItem);
      }

      // get last part of the id (after the last dot)
      const beforeLastDot = property.id?.split('.').slice(0, -1).join('.');
      const afterLastDot = property.id?.split('.').pop();

      // replace all the dot with a space
      // first letter of words to uppercase
      const leftPart = (beforeLastDot ?? property.title).replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const rightPart = afterLastDot?.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      const displayName = `${leftPart}: ${rightPart}`;

      if (property.id) {
        const newItem: PropertyWithDisplayName = { ...property, id: property.id, displayName };

        // do we have a dynamic enum ?
        if (property.enum) {
          // get the enum from the context using the following key
          // ${groupName}.DockerCompatibility.${property.id}

          // get the enum from the context
          const enumKey = `${name}.DockerCompatibility.${property.id}`;
          const enumItemsRaw = globalContext.getValue<unknown>(enumKey);

          // check if the raw value is an array and contains the expected fields of EnumItem type
          if (!Array.isArray(enumItemsRaw)) {
            continue;
          }
          if (
            !enumItemsRaw.every(
              item => typeof item === 'object' && 'label' in item && 'value' in item && 'selected' in item,
            )
          ) {
            continue;
          }
          const enumItems = enumItemsRaw as EnumItem[];
          if (enumItems) {
            newItem.enumItems = enumItems;
            newItem.selectedValue = enumItems.find(item => item.selected)?.value;
          }
        }

        // add the property to the group
        groupItem.properties.push(newItem);
      }
    }
  }
  groupItems.items = updatedGroupItems;
}

async function onChangeProperty(property: PropertyWithDisplayName, value: unknown): Promise<void> {
  // notify a configuration change using the DockerCompatibility scope
  await window.updateConfigurationValue(property.id, value, 'DockerCompatibility');
}
</script>

{#each groupItems.items as groupItem, index (index)}
  <div class="container flex flex-row w-full pt-2" role="list" aria-label="{groupItem.name}">
    <!-- column with the group-->
    <div class="h-full bg-[var(--pd-button-primary-bg)] rounded-sm p-1">
      {#if groupItem.icon}
        <Icon icon={groupItem.icon} title={groupItem.name} class="max-w-6 max-h-6" />
      {/if}
    </div>

    <!-- column with the cards-->
    <div class="px-2 w-full space-y-4">
      {#each groupItem.properties as property (property.id)}
        <div
          class="bg-[var(--pd-invert-content-card-bg)] rounded-md ml-2 divide-x divide-[var(--pd-content-divider)] flex flex-col lg:flex-row w-full"
        >
          <div
            class="flex flex-row grow p-2 justify-between text-[color:var(--pd-invert-content-card-text)] w-full"
          >
            <div class="flex flex-col w-full">
              <div
                class="flex flex-row items-center text-[color:var(--pd-invert-content-card-text)]"
                role="status"
                aria-label="{property.displayName}"
              >
                {property.displayName}
              </div>
              <div class="mt-2 flex flex-row items-center">
                <div class="flex flex-col w-full" role="document" aria-label="{property.id}">
                  <Markdown markdown={property.markdownDescription} />
                </div>
              </div>
              {#if property.enumItems && property.enumItems.length > 0}
                <Dropdown
                  name="select-property-{property.id}"
                  ariaLabel="dropdown for property {property.id}"
                  disabled={property.enumItems.length === 0}
                  bind:value={property.selectedValue}
                  onChange={(val: unknown): Promise<void> => onChangeProperty(property, val)}
                  options={property.enumItems}>
                </Dropdown>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/each}
