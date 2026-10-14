<script lang="ts">
import type { Menu } from '@desktop-framework/api';
import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faPlug } from '@fortawesome/free-solid-svg-icons';
import { onDestroy } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import { removeNonSerializableProperties } from '/@/lib/actions/ActionUtils';
import type { ContextUI } from '/@/lib/context/context';
import { ContextKeyExpr } from '/@/lib/context/contextKey';
import { transformObjectToContext } from '/@/lib/context/ContextUtils';
import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';
import { context as storeContext } from '/@/stores/context';

interface Props {
  args: unknown[];
  contextPrefix?: string;
  dropdownMenu?: boolean;
  contributions: Menu[];
  detailed?: boolean;
  contextUI?: ContextUI;
  onError: (errorMessage: string) => void;
}

const {
  args,
  contextPrefix,
  dropdownMenu = false,
  contributions = [],
  detailed = false,
  contextUI,
  onError,
}: Props = $props();

const filteredContributions = $derived(
  contributions.reduce((previousValue, currentValue) => {
    // Transform the unknown[] args objects as contexts
    const argsContexts = args.map(arg => transformObjectToContext(arg, contextPrefix));

    // If no when property is set, we keep all additional menus
    if (currentValue.when === undefined) return [...previousValue, currentValue];

    // Deserialize the `when` property
    const whenDeserialized = ContextKeyExpr.deserialize(currentValue.when);

    // Evaluate with global context first
    if (globalContext && whenDeserialized?.evaluate(globalContext)) {
      return [...previousValue, currentValue];
    }

    // Evaluate the arguments as context
    for (let argsContext of argsContexts) {
      if (whenDeserialized?.evaluate(argsContext)) {
        return [...previousValue, currentValue];
      }
    }
    return previousValue;
  }, [] as Menu[]),
);

let globalContext: ContextUI | undefined = $state();
let contextsUnsubscribe: Unsubscriber;

$effect(() => {
  if (contextUI) {
    globalContext = contextUI;
  } else {
    if (contextsUnsubscribe) {
      contextsUnsubscribe();
    }
    contextsUnsubscribe = storeContext.subscribe(value => {
      globalContext = value;
    });
  }
});

function getIcon(menu: Menu): IconDefinition | string {
  const defaultIcon = faPlug;
  if (!menu.icon) {
    return defaultIcon;
  }

  const match = menu.icon.match(/\$\{(.*)\}/);
  if (match?.length === 2) {
    const className = match[1];
    return menu.icon.replace(match[0], `podman-desktop-icon-${className}`);
  }

  return menu.icon;
}

onDestroy(() => {
  // unsubscribe from the store
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});

async function executeContribution(menu: Menu): Promise<void> {
  try {
    await window.executeCommand(menu.command, ...removeNonSerializableProperties(args));
  } catch (err) {
    onError(`Error while executing ${menu.title}: ${String(err)}`);
  }
}
</script>

{#each filteredContributions as menu, index (index)}
  <ListItemButtonIcon
    title={menu.title}
    onClick={(): Promise<void> => executeContribution(menu)}
    menu={dropdownMenu}
    icon={getIcon(menu)}
    detailed={detailed}
    disabledWhen={menu.disabled}
    contextUI={globalContext} />
{/each}
