<script lang="ts">
import type { Menu } from '../../../../main/src/plugin/menu-registry';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import { removeNonSerializableProperties } from '/@/lib/actions/ActionUtils';
import type { ContextUI } from '/@/lib/context/context';
import { onDestroy, onMount } from 'svelte';
import { context } from '/@/stores/context';
import type { Unsubscriber } from 'svelte/store';
import { ContextKeyExpr } from '/@/lib/context/contextKey';
import { transformObjectToContext } from '/@/lib/context/ContextUtils';

export let args: unknown[];

export let contextPrefix: string | undefined = undefined;

export let dropdownMenu = false;
export let contributions: Menu[] = [];

let filteredContributions: Menu[] = [];
$: {
  filteredContributions = contributions.reduce((previousValue, currentValue) => {
    // If no when property is set, we keep all additional menus
    if (currentValue.when === undefined) return [...previousValue, currentValue];

    // Deserialize the `when` property
    const whenDeserialized = ContextKeyExpr.deserialize(currentValue.when);

    // Evaluate with global context first
    if (globalContext && whenDeserialized?.evaluate(globalContext)) {
      return [...previousValue, currentValue];
    }

    // Transform the unknown[] args objects as contexts
    const argsContexts = args.map(arg => transformObjectToContext(arg, contextPrefix));

    // Evaluate the arguments as context
    for (let argsContext of argsContexts) {
      if (whenDeserialized?.evaluate(argsContext)) {
        return [...previousValue, currentValue];
      }
    }
    return previousValue;
  }, [] as Menu[]);
}

let globalContext: ContextUI;
let contextsUnsubscribe: Unsubscriber;

onMount(async () => {
  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;
  });
});

onDestroy(() => {
  // unsubscribe from the store
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});
export let onError: (errorMessage: string) => void;

async function executeContribution(menu: Menu): Promise<void> {
  try {
    await window.executeCommand(menu.command, ...removeNonSerializableProperties(args));
  } catch (err) {
    onError(`Error while executing ${menu.title}: ${String(err)}`);
  }
}
</script>

{#each filteredContributions as menu}
  <ListItemButtonIcon
    title="{menu.title}"
    onClick="{() => executeContribution(menu)}"
    menu="{dropdownMenu}"
    icon="{faEllipsisVertical}"
    disabledWhen="{menu.disabled}" />
{/each}
