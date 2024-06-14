<script lang="ts">
import { onDestroy } from 'svelte';
import type { Unsubscriber } from 'svelte/motion';

import { context as storeContext } from '/@/stores/context';

import type { ContextUI } from '../context/context';
import { ContextKeyExpr } from './contextKey';

export let expression: string = '';
export let contextUI: ContextUI | undefined = undefined;

let globalContext: ContextUI;
let contextsUnsubscribe: Unsubscriber;

let enabled: boolean = true;

$: {
  if (expression !== '') {
    if (contextUI) {
      globalContext = contextUI;
      computeEnabled();
    } else {
      if (contextsUnsubscribe) {
        contextsUnsubscribe();
      }
      contextsUnsubscribe = storeContext.subscribe(value => {
        globalContext = value;
        computeEnabled();
      });
    }
  }
}

function computeEnabled() {
  // Deserialize the `when` property
  const whenDeserialized = ContextKeyExpr.deserialize(expression);
  // if there is some error when evaluating the when expression, we use the default value enabled = true
  enabled = whenDeserialized?.evaluate(globalContext) ?? true;
}

onDestroy(() => {
  // unsubscribe from the store
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});
</script>

<slot enabled="{enabled}" />
