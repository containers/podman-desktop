<script lang="ts">
import { configurationProperties } from '../../stores/configurationProperties';
import { Buffer } from 'buffer';
import { onMount } from 'svelte';
import { Route, router } from 'tinro';
import {
  ConfigurationRegistry,
  IConfigurationPropertyRecordedSchema,
} from '../../../../preload/src/configuration-registry';

import TreeView from '../treeview/TreeView.svelte';
import type { TreeViewDataItem } from '../treeview/TreeViewDataItem';
import PreferencesRendering from './PreferencesRendering.svelte';
import PreferencesContainerConnectionRendering from './PreferencesContainerConnectionRendering.svelte';

let items: TreeViewDataItem[] = [];
let properties: IConfigurationPropertyRecordedSchema[];

function onSelectedItem(item: TreeViewDataItem) {
  if (item.id.startsWith('container-connection@')) {
    // extract provider by the name before the @
    const provider = item.id.split('@')[1];
    const connection = item.id.split('@')[2];
    router.goto(`/preferences/container-connection/${provider}/${connection}`);
  } else {
    router.goto(`/preferences/default/${item.id}`);
  }
}

async function buildTreeViewData(configProperties: IConfigurationPropertyRecordedSchema[]): Promise<void> {
  const treeViewDataItems: TreeViewDataItem[] = [];

  // first, add all features (using the default scope)
  configProperties
    .filter(property => property.scope === ConfigurationRegistry.DEFAULT_SCOPE)
    .forEach(property => {
      // split parent id from property id
      const [parentLeftId] = property.parentId.split('.');
      let parentItem = treeViewDataItems.find(item => item.id === parentLeftId);
      if (!parentItem) {
        parentItem = {
          id: parentLeftId,
          name: parentLeftId,
          children: [],
        };
        treeViewDataItems.push(parentItem);
      }
      // add child if not existing
      let childItem = parentItem.children.find(item => item.id === property.parentId);
      if (!childItem) {
        parentItem.children.push({
          id: property.parentId,
          name: property.title,
          children: [],
        });
      }
      properties = configProperties;
    });

  // now map all the connections
  const providers = await window.getProviderInfos();
  const containerConnectionsTreeViewDataItem = [];
  providers.forEach(provider => {
    provider.containerConnections.forEach(connection => {
      containerConnectionsTreeViewDataItem.push({
        // encode socketpath as base64
        id: `container-connection@${provider.id}@${Buffer.from(connection.endpoint.socketPath).toString('base64')}`,
        name: `${connection.name} (${provider.name})`,
        children: [],
      });
    });
  });

  if (containerConnectionsTreeViewDataItem.length > 0) {
    treeViewDataItems.push({
      id: 'container-connection@',
      name: 'Container Provider Resources',
      children: containerConnectionsTreeViewDataItem,
    });
  }

  items = treeViewDataItems;
}

onMount(async () => {
  configurationProperties.subscribe(value => {
    buildTreeViewData(value);
  });
});
</script>

<div class="flex h-full">
  <TreeView items="{items}" onSelect="{item => onSelectedItem(item)}" />
  <Route path="/">
    {#if items.length > 0}
      <PreferencesRendering key="{items[0].id}" properties="{properties}" />
    {:else}
      empty
    {/if}
  </Route>
  <Route path="/default/:key" let:meta>
    <PreferencesRendering key="{meta.params.key}" properties="{properties}" />
  </Route>
  <Route path="/container-connection/" let:meta />
  <Route path="/container-connection/:provider/:connection" let:meta>
    <PreferencesContainerConnectionRendering
      providerId="{meta.params.provider}"
      connection="{meta.params.connection}"
      properties="{properties}" />
  </Route>
</div>
