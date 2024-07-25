<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import { notificationQueue } from '/@/stores/notifications';
import { providerInfos } from '/@/stores/providers';

import NewContentBadge from '../ui/NewContentBadge.svelte';

let providersId: string[] = [];
let notificationCount: number = 0;
let hasNewProviders = false;
let hasNewNotifications = false;
$: hasNew = hasNewProviders || hasNewNotifications;

let providersUnsubscribe: Unsubscriber;
let notificationsUnsubscribe: Unsubscriber;

onMount(() => {
  // if there is a new provider we display the dot
  providersUnsubscribe = providerInfos.subscribe(updatedProviders => {
    const updatedProvidersId = updatedProviders.map(prov => prov.internalId).sort();
    if (!hasNewProviders) {
      // if the user is in the dashboard page we do not check for new providers
      hasNewProviders = hasNewProvider(providersId, updatedProvidersId);
    }
    providersId = updatedProvidersId;
  });

  // if there is a new notification we display the dot
  notificationsUnsubscribe = notificationQueue.subscribe(notifications => {
    if (!hasNewNotifications) {
      // if the user is in the dashboard page we do not check for new notifications
      hasNewNotifications = notifications.length > notificationCount;
    }
    notificationCount = notifications.length;
  });
});

onDestroy(() => {
  providersUnsubscribe?.();
  notificationsUnsubscribe?.();
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

function onHide() {
  hasNewProviders = false;
  hasNewNotifications = false;
}
</script>

<div class="absolute top-0 right-[-9px]">
  <NewContentBadge pagePath="/" show={hasNew} onHide={onHide} />
</div>
