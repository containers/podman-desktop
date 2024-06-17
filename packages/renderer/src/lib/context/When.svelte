<script lang="ts">
import { onDestroy } from 'svelte';
import type { Unsubscriber } from 'svelte/motion';

import { context as storeContext } from '/@/stores/context';

import type { ContextUI } from '../context/context';
import { ContextKeyExpr } from './contextKey';

export let expression: string = '';
export let contextUI: ContextUI | undefined = undefined;
export let fallback: boolean = false;

let globalContext: ContextUI;
let contextsUnsubscribe: Unsubscriber;

let result: boolean = fallback;

$: {
  if (expression !== '') {
    if (contextUI) {
      globalContext = contextUI;
      computeResult();
    } else {
      if (contextsUnsubscribe) {
        contextsUnsubscribe();
      }
      contextsUnsubscribe = storeContext.subscribe(value => {
        globalContext = value;
        computeResult();
      });
    }
  }
}

function computeResult() {
  // Deserialize the `when` property
  const whenDeserialized = ContextKeyExpr.deserialize(expression);
  if (!whenDeserialized) return fallback;
  result = whenDeserialized.evaluate(globalContext);
}

onDestroy(() => {
  // unsubscribe from the store
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});
</script>

<slot result="{result}" />
