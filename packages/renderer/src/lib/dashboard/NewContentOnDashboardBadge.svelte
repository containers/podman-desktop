<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { providerInfos } from '/@/stores/providers';
import { notificationQueue } from '/@/stores/notifications';
import { router } from 'tinro';
import type { Unsubscriber } from 'svelte/motion';

let providersId: string[] = [];
let notificationCount: number = 0;
let hasNewProviders = false;
let hasNewNotification = false;
let isInDashBoard = true;
let hasNew: boolean;
$: hasNew = !isInDashBoard && (hasNewProviders || hasNewNotification);

let providersUnsubscribe: Unsubscriber;
let notificationsUnsubscribe: Unsubscriber;
let routerUnsubscribe: Unsubscriber;

onMount(() => {
  // if there is a new provider we display the dot
  providersUnsubscribe = providerInfos.subscribe(updatedProviders => {
    const updatedProvidersId = updatedProviders.map(prov => prov.internalId).sort();
    if (!isInDashBoard && !hasNew) {
      // if the user is in the dashboard page we do not check for new providers
      hasNewProviders = hasNewProvider(providersId, updatedProvidersId);
    }
    providersId = updatedProvidersId;
  });

  // if there is a new notification we display the dot
  notificationsUnsubscribe = notificationQueue.subscribe(notifications => {
    if (!isInDashBoard && !hasNew) {
      // if the user is in the dashboard page we do not check for new notifications
      hasNewNotification = notifications.length > notificationCount;
    }
    notificationCount = notifications.length;
  });

  // listen to router change, so we can reset the changes and update the dot visibility
  routerUnsubscribe = router.subscribe(route => {
    isInDashBoard = route.path === '/';
    if (isInDashBoard) {
      hasNewProviders = false;
      hasNewNotification = false;
    }
  });
});

onDestroy(() => {
  providersUnsubscribe?.();
  notificationsUnsubscribe?.();
  routerUnsubscribe?.();
});

function hasNewProvider(oldProvidersId: string[], newProvidersId: string[]): boolean {
  if (oldProvidersId.length < newProvidersId.length) {
    return true;
  }
  for (let [index, id] of newProvidersId.entries()) {
    if (id !== oldProvidersId[index]) {
      return true;
    }
  }
  return false;
}
</script>

{#if hasNew}
  <div aria-label="New content available" class="w-[6px] h-[6px] bg-purple-500 rounded-full"></div>
{/if}
