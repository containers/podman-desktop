<script lang="ts">
import { configurationProperties } from '../../stores/configurationProperties';
import { Buffer } from 'buffer';
import { onMount } from 'svelte';
import { Route, router } from 'tinro';
import {
  ConfigurationRegistry,
  IConfigurationPropertyRecordedSchema,
} from '../../../../main/src/plugin/configuration-registry';

import TreeView from '../treeview/TreeView.svelte';
import type { TreeViewDataItem } from '../treeview/TreeViewDataItem';
import PreferencesRendering from './PreferencesRendering.svelte';
import PreferencesContainerConnectionRendering from './PreferencesContainerConnectionRendering.svelte';
import { providerInfos } from '../../stores/providers';
import PreferencesProviderRendering from './PreferencesProviderRendering.svelte';
import { extensionInfos } from '../../stores/extensions';
import PreferencesExtensionRendering from './PreferencesExtensionRendering.svelte';
import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import PreferencesRegistriesRendering from './PreferencesRegistriesRendering.svelte';

let items: TreeViewDataItem[] = [];
let extensions: ExtensionInfo[] = [];
let properties: IConfigurationPropertyRecordedSchema[];

function onSelectedItem(item: TreeViewDataItem) {
  if (item.id.startsWith('provider@')) {
    const providerId = item.id.split('@')[1];
    router.goto(`/preferences/provider/${providerId}`);
  } else if (item.id.startsWith('container-connection@')) {
    // extract provider by the name before the @
    const provider = item.id.split('@')[1];
    const connection = item.id.split('@')[2];
    router.goto(`/preferences/container-connection/${provider}/${connection}`);
  } else if (item.id === 'extensions') {
    router.goto(`/preferences/extensions`);
  } else if (item.id.startsWith('extension@')) {
    // extract extension by the name before the @
    const extensionId = item.id.split('@')[1];
    router.goto(`/preferences/extension/${extensionId}`);
  } else if (item.id === 'registries') {
    router.goto('/preferences/registries');
  } else {
    router.goto(`/preferences/default/${item.id}`);
  }
}

async function buildTreeViewData(configProperties?: IConfigurationPropertyRecordedSchema[]): Promise<void> {
  const treeViewDataItems: TreeViewDataItem[] = [];

  if (!configProperties) {
    if (properties) {
      configProperties = properties;
    } else {
      return;
    }
  }

  // map all the connections
  const providers = await window.getProviderInfos();
  const providerTreeViewDataItems = [];
  providers.forEach(provider => {
    const providerTreeViewDataItem = {
      id: `provider@${provider.internalId}`,
      name: provider.name,
      children: [],
    };
    providerTreeViewDataItems.push(providerTreeViewDataItem);

    // add under the provider the container connection links
    provider.containerConnections.forEach(connection => {
      providerTreeViewDataItem.children.push({
        // encode socketpath as base64
        id: `container-connection@${provider.internalId}@${Buffer.from(connection.endpoint.socketPath).toString(
          'base64',
        )}`,
        name: `${connection.name}`,
        children: [],
      });
    });
  });

  if (providerTreeViewDataItems.length > 0) {
    treeViewDataItems.push({
      id: 'providers',
      name: 'Resources',
      children: providerTreeViewDataItems,
    });
  }

  // Add registries
  treeViewDataItems.push({
    id: 'registries',
    name: 'Registries',
    children: [],
  });

  // then, add all features (using the default scope)
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

  // now adds the extensions
  const extensionsTreeViewDataItems = [];
  extensions.forEach(extension => {
    const extensionItem = {
      id: `extension@${extension.name}`,
      name: extension.name,
      children: [],
    };
    extensionsTreeViewDataItems.push(extensionItem);
  });
  if (extensionsTreeViewDataItems.length > 0) {
    treeViewDataItems.push({
      id: 'extensions',
      name: 'Extensions Catalog',
      children: extensionsTreeViewDataItems,
    });
  }

  items = treeViewDataItems;
}

onMount(async () => {
  configurationProperties.subscribe(value => {
    buildTreeViewData(value);
  });
  providerInfos.subscribe(() => {
    buildTreeViewData();
  });
  extensionInfos.subscribe(value => {
    extensions = value;
    buildTreeViewData();
  });
});
</script>

<div class="flex h-full">
  <div class="pr-2">
    <TreeView items="{items}" onSelect="{item => onSelectedItem(item)}" />
  </div>
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
  <Route path="/extensions" let:meta />
  <Route path="/extension/:extensionId" let:meta>
    <PreferencesExtensionRendering extensionId="{meta.params.extensionId}" />
  </Route>
  <Route path="/provider/:providerInternalId" let:meta>
    <PreferencesProviderRendering providerInternalId="{meta.params.providerInternalId}" properties="{properties}" />
  </Route>
  <Route path="/registries">
    <PreferencesRegistriesRendering />
  </Route>
  <Route path="/container-connection/" let:meta />
  <Route path="/container-connection/:provider/:connection" let:meta>
    <PreferencesContainerConnectionRendering
      providerInternalId="{meta.params.provider}"
      connection="{meta.params.connection}"
      properties="{properties}" />
  </Route>
</div>
