<script lang="ts">
/* eslint-disable import/no-duplicates */
import { onDestroy, onMount } from 'svelte';
import { get, type Unsubscriber, type Writable } from 'svelte/store';

/* eslint-enable import/no-duplicates */
import { configurationProperties } from '/@/stores/configurationProperties';
import { context } from '/@/stores/context';
import { extensionInfos } from '/@/stores/extensions';
import type { ExtensionInfo } from '/@api/extension-info';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import IconImage from '../../appearance/IconImage.svelte';
import type { ContextUI } from '../../context/context';
import Markdown from '../../markdown/Markdown.svelte';
import { isPropertyValidInContext } from '../Util';

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

interface PropertyWithDisplayName extends IConfigurationPropertyRecordedSchema {
  displayName: string;
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

      // add the property to the group
      groupItem.properties.push({ ...property, displayName });
    }
  }
  groupItems.items = updatedGroupItems;
}
</script>

{#each groupItems.items as groupItem}
  <div class="container flex flex-row w-full pt-2" role="list" aria-label="{groupItem.name}">
    <!-- column with the group-->
    <div class="h-full bg-[var(--pd-button-primary-bg)] rounded p-1">
      <IconImage
        image={groupItem.icon}
        alt={groupItem.name}
        class="max-w-6 max-h-6"
      />
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
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/each}
