<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/motion';

import { notificationQueue } from '/@/stores/notifications';

import type { NotificationCard } from '../../../../main/src/plugin/api/notification';
import NotificationCardItem from './NotificationCardItem.svelte';

let notificationsUnsubscribe: Unsubscriber;
let notifications: NotificationCard[] = [];

onMount(async () => {
  notificationsUnsubscribe = notificationQueue.subscribe(value => {
    // take only first 3 elements of the notifications queue
    notifications = value.filter(n => n.highlight).slice(0, 3);
  });
});

onDestroy(() => {
  if (notificationsUnsubscribe) {
    notificationsUnsubscribe();
  }
});
</script>

{#if notifications.length > 0}
  <div class="bg-charcoal-800 m-5 px-5 py-4 rounded-lg">
    <div class="flex flex-col items-center justify-content space-y-3" role="region" aria-label="Notifications Box">
      <span class="text-md text-white mb-1">Notifications</span>
      {#each notifications as notification}
        <NotificationCardItem notification="{notification}" />
      {/each}
    </div>
  </div>
{/if}
